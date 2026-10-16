"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type CreateOrderInput = {
  customerId: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryFee: number;
  paymentStatus: string;
  orderStatus: string;
  notes: string;
  items: {
    productId: string;
    quantity: number;
  }[];
};

type CreateOrderResult = {
  error: string;
  orderId?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "partially_paid",
  "failed",
  "refunded",
];

const ORDER_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
];

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = claimsData?.claims?.email;

  if (
    claimsError ||
    !userEmail ||
    !adminEmail ||
    String(userEmail).toLowerCase() !== adminEmail
  ) {
    return {
      error: "Your session is invalid or you are not authorized.",
    };
  }

  if (
    !input ||
    typeof input !== "object" ||
    !UUID_PATTERN.test(input.customerId ?? "") ||
    !Array.isArray(input.items) ||
    input.items.length < 1 ||
    input.items.length > 100
  ) {
    return { error: "Please provide a valid customer and at least one product." };
  }

  if (
    !Number.isFinite(input.deliveryFee) ||
    input.deliveryFee < 0 ||
    input.deliveryFee > 9999999999.99
  ) {
    return { error: "Enter a valid delivery fee." };
  }

  if (
    !PAYMENT_STATUSES.includes(input.paymentStatus) ||
    !ORDER_STATUSES.includes(input.orderStatus)
  ) {
    return { error: "Please select valid payment and order statuses." };
  }

  if (
    typeof input.customerPhone !== "string" ||
    input.customerPhone.length > 50 ||
    typeof input.deliveryAddress !== "string" ||
    input.deliveryAddress.length > 2000 ||
    typeof input.notes !== "string" ||
    input.notes.length > 5000
  ) {
    return { error: "One or more fields exceed the allowed length." };
  }

  const seenProducts = new Set<string>();

  for (const item of input.items) {
    if (
      !item ||
      !UUID_PATTERN.test(item.productId ?? "") ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 2147483647 ||
      seenProducts.has(item.productId)
    ) {
      return {
        error: "One or more products or quantities are invalid.",
      };
    }

    seenProducts.add(item.productId);
  }

  const { data: orderId, error } = await supabase.rpc(
    "create_crm_order",
    {
      p_customer_id: input.customerId,
      p_customer_phone: input.customerPhone.trim(),
      p_delivery_address: input.deliveryAddress.trim(),
      p_delivery_fee: input.deliveryFee,
      p_payment_status: input.paymentStatus,
      p_order_status: input.orderStatus,
      p_notes: input.notes.trim(),
      p_items: input.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    }
  );

  if (error) {
    console.error("Create order failed:", error.code, error.message);

    if (error.message.includes("Insufficient stock")) {
      return { error: error.message };
    }

    if (
      error.message.includes("not authorized") ||
      error.message.includes("not authorized to create orders")
    ) {
      return { error: "You are not authorized to create orders." };
    }

    return {
      error:
        "The order could not be created. Please check the details and try again.",
    };
  }

  if (typeof orderId !== "string" || !UUID_PATTERN.test(orderId)) {
    return {
      error: "The database did not return a valid order reference.",
    };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/products");
  revalidatePath("/");

  return {
    error: "",
    orderId,
  };
}


const ALLOWED_ORDER_STATUSES = ["pending", "processing", "completed"];
const ALLOWED_PAYMENT_STATUSES = [
  "pending",
  "paid",
  "partially_paid",
  "failed",
  "refunded",
];

export async function updateOrderStatuses(
  orderId: string,
  orderStatus: string,
  paymentStatus: string
): Promise<{ error: string }> {
  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!UUID_PATTERN.test(orderId)) {
    return { error: "Invalid order reference." };
  }

  if (!ALLOWED_ORDER_STATUSES.includes(orderStatus)) {
    return { error: "Please select a valid order status." };
  }

  if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
    return { error: "Please select a valid payment status." };
  }

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = claimsData?.claims?.email;

  if (
    claimsError ||
    !userEmail ||
    !adminEmail ||
    String(userEmail).toLowerCase() !== adminEmail
  ) {
    return {
      error: "Your session is invalid or you are not authorized.",
    };
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      order_status: orderStatus,
      payment_status: paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Update order status failed:", error.code, error.message);
    return {
      error: "Unable to update this order. Please try again.",
    };
  }

  if (!data) {
    return { error: "Order not found or you cannot update it." };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/");

  return { error: "" };
}


export async function cancelOrder(
  orderId: string
): Promise<{ error: string }> {
  if (!UUID_PATTERN.test(orderId)) {
    return { error: "Invalid order reference." };
  }

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = claimsData?.claims?.email;

  if (
    claimsError ||
    !userEmail ||
    !adminEmail ||
    String(userEmail).toLowerCase() !== adminEmail
  ) {
    return {
      error: "Your session is invalid or you are not authorized.",
    };
  }

  const { error } = await supabase.rpc("cancel_crm_order", {
    p_order_id: orderId,
  });

  if (error) {
    console.error("Cancel order failed:", error.code, error.message);

    if (error.message.includes("already been cancelled")) {
      return { error: "This order has already been cancelled." };
    }

    if (
      error.message.includes("Only pending or processing orders")
    ) {
      return {
        error: "Only pending or processing orders can be cancelled.",
      };
    }

    if (error.message.includes("received payment")) {
      return {
        error:
          "This order has received payment. Handle the refund before cancellation.",
      };
    }

    if (error.message.includes("not authorized")) {
      return { error: "You are not authorized to cancel orders." };
    }

    if (error.message.includes("Order not found")) {
      return { error: "Order not found." };
    }

    return {
      error:
        "Unable to cancel this order. Please check its status and try again.",
    };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/products");
  revalidatePath("/");

  return { error: "" };
}

