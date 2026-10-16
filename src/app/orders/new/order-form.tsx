"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createOrder } from "../actions";
import {
  AlertCircle,
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

type Customer = {
  id: string;
  full_name: string;
  phone: string | null;
  phone_secondary: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  available_units: number;
  is_active: boolean;
};

type CartItem = {
  productId: string;
  quantity: number;
};

type OrderFormProps = {
  customers: Customer[];
  products: Product[];
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

const paymentStatuses = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const orderStatuses = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
];

export default function OrderForm({
  customers,
  products,
}: OrderFormProps) {
  const router = useRouter();

  const [customerId, setCustomerId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [orderStatus, setOrderStatus] = useState("pending");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState("");

  const cartDetails = useMemo(
    () =>
      cart.map((item) => {
        const product = products.find(
          (entry) => entry.id === item.productId
        );

        return {
          ...item,
          product,
          lineTotal: product
            ? Number(product.price) * item.quantity
            : 0,
        };
      }),
    [cart, products]
  );

  const subtotal = cartDetails.reduce(
    (total, item) => total + item.lineTotal,
    0
  );

  const parsedDeliveryFee = Number(deliveryFee);

  const validDeliveryFee =
    deliveryFee.trim() !== "" &&
    Number.isFinite(parsedDeliveryFee) &&
    parsedDeliveryFee >= 0 &&
    parsedDeliveryFee <= 9999999999.99;

  const total =
    subtotal + (validDeliveryFee ? parsedDeliveryFee : 0);

  const hasItems =
    cart.length > 0 &&
    cartDetails.every(
      (item) =>
        item.product &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= item.product.available_units
    );

  function handleCustomerChange(id: string) {
    setCustomerId(id);

    const customer = customers.find((entry) => entry.id === id);

    setCustomerPhone(customer?.phone ?? "");

    const addressParts = [
      customer?.address,
      customer?.city,
      customer?.state,
      customer?.country,
    ].filter(Boolean);

    setDeliveryAddress(addressParts.join(", "));
  }

  function addProduct(productId: string) {
    const product = products.find(
      (entry) => entry.id === productId
    );

    if (!product || product.available_units < 1) {
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === productId
      );

      if (existing) {
        if (existing.quantity >= product.available_units) {
          return current;
        }

        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { productId, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, quantity: number) {
    const product = products.find(
      (entry) => entry.id === productId
    );

    if (!product) {
      return;
    }

    if (quantity < 1) {
      setCart((current) =>
        current.filter((item) => item.productId !== productId)
      );
      return;
    }

    if (quantity > product.available_units) {
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  }

  function removeProduct(productId: string) {
    setCart((current) =>
      current.filter((item) => item.productId !== productId)
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customerId || !hasItems || !validDeliveryFee || isPending) {
      return;
    }

    setSubmitError("");

    startTransition(async () => {
      try {
        const result = await createOrder({
          customerId,
          customerPhone,
          deliveryAddress,
          deliveryFee: parsedDeliveryFee,
          paymentStatus,
          orderStatus,
          notes,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        });

        if (result.error) {
          setSubmitError(result.error);
          return;
        }

        if (result.orderId) {
          router.push(`/orders/${result.orderId}`);
          router.refresh();
          return;
        }

        setSubmitError(
          "The order could not be confirmed. Please try again."
        );
      } catch {
        setSubmitError(
          "An unexpected error occurred while creating the order. Please try again."
        );
      }
    });
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const labelClass = "text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-950">
          1. Customer Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select an existing customer to prefill their details.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="customer" className={labelClass}>
              Customer <span className="text-red-500">*</span>
            </label>

            <select
              id="customer"
              value={customerId}
              onChange={(event) =>
                handleCustomerChange(event.target.value)
              }
              required
              className={inputClass}
            >
              <option value="">Select a customer</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.full_name}
                  {customer.phone ? ` — ${customer.phone}` : ""}
                </option>
              ))}
            </select>

            {customers.length === 0 && (
              <p className="mt-2 text-sm text-amber-700">
                No customers found. Add a customer before creating an
                order.
              </p>
            )}

            <Link
              href="/customers/new"
              className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              + Add a customer
            </Link>
          </div>

          <div>
            <label htmlFor="customerPhone" className={labelClass}>
              Customer Phone
            </label>

            <input
              id="customerPhone"
              value={customerPhone}
              onChange={(event) =>
                setCustomerPhone(event.target.value)
              }
              maxLength={50}
              className={inputClass}
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label htmlFor="deliveryAddress" className={labelClass}>
              Delivery Address
            </label>

            <textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(event) =>
                setDeliveryAddress(event.target.value)
              }
              maxLength={2000}
              rows={3}
              className={inputClass}
              placeholder="Enter delivery address"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-950">
          2. Products
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select products and quantities for this order.
        </p>

        <div className="mt-5">
          <label htmlFor="productPicker" className={labelClass}>
            Add Product
          </label>

          <select
            id="productPicker"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                addProduct(event.target.value);
                event.target.value = "";
              }
            }}
            className={inputClass}
          >
            <option value="">Choose a product to add</option>

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
                disabled={product.available_units < 1}
              >
                {product.name} —{" "}
                {currency.format(Number(product.price))} (
                {product.available_units} in stock)
              </option>
            ))}
          </select>

          {products.length === 0 && (
            <p className="mt-2 text-sm text-amber-700">
              No active products found. Add or activate a product first.
            </p>
          )}
        </div>

        <div className="mt-5 overflow-x-auto">
          {cartDetails.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center">
              <ShoppingBag
                size={32}
                className="mx-auto mb-3 text-gray-400"
              />

              <p className="font-medium text-gray-700">
                No products added yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Choose a product above to begin.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 text-right font-medium">
                    Unit Price
                  </th>
                  <th className="px-3 py-3 text-center font-medium">
                    Quantity
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    Total
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    Remove
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {cartDetails.map((item) => (
                  <tr key={item.productId}>
                    <td className="px-3 py-4">
                      <p className="font-medium text-gray-900">
                        {item.product?.name}
                      </p>

                      {item.product?.sku && (
                        <p className="mt-1 text-xs text-gray-500">
                          SKU: {item.product.sku}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-4 text-right text-gray-600">
                      {currency.format(
                        Number(item.product?.price ?? 0)
                      )}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
                          aria-label={`Decrease ${item.product?.name} quantity`}
                        >
                          <Minus size={14} />
                        </button>

                        <span className="min-w-6 text-center font-medium">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            item.quantity >=
                            (item.product?.available_units ?? 0)
                          }
                          className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Increase ${item.product?.name} quantity`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="mt-1 text-center text-xs text-gray-400">
                        Max {item.product?.available_units ?? 0}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-right font-medium text-gray-900">
                      {currency.format(item.lineTotal)}
                    </td>

                    <td className="px-3 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => removeProduct(item.productId)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        aria-label={`Remove ${item.product?.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-950">
          3. Payment and Delivery
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="deliveryFee" className={labelClass}>
              Delivery Fee (₦)
            </label>

            <input
              id="deliveryFee"
              type="number"
              min="0"
              max="9999999999.99"
              step="0.01"
              value={deliveryFee}
              onChange={(event) =>
                setDeliveryFee(event.target.value)
              }
              required
              className={inputClass}
            />

            {!validDeliveryFee && (
              <p className="mt-1 text-sm text-red-600">
                Enter a valid non-negative delivery fee.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="paymentStatus" className={labelClass}>
              Payment Status
            </label>

            <select
              id="paymentStatus"
              value={paymentStatus}
              onChange={(event) =>
                setPaymentStatus(event.target.value)
              }
              className={inputClass}
            >
              {paymentStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="orderStatus" className={labelClass}>
              Order Status
            </label>

            <select
              id="orderStatus"
              value={orderStatus}
              onChange={(event) =>
                setOrderStatus(event.target.value)
              }
              className={inputClass}
            >
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className={labelClass}>
              Order Notes
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={5000}
              rows={3}
              className={inputClass}
              placeholder="Optional notes about this order"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-950">
          Order Summary
        </h2>

        <div className="mt-5 ml-auto max-w-sm space-y-3">
          <div className="flex justify-between gap-4 text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{currency.format(subtotal)}</span>
          </div>

          <div className="flex justify-between gap-4 text-sm text-gray-600">
            <span>Delivery Fee</span>
            <span>
              {currency.format(
                validDeliveryFee ? parsedDeliveryFee : 0
              )}
            </span>
          </div>

          <div className="flex justify-between gap-4 border-t border-gray-200 pt-4 text-lg font-bold text-gray-950">
            <span>Total</span>
            <span>{currency.format(total)}</span>
          </div>
        </div>

        {submitError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {submitError}
          </div>
        )}

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <p>
            Stock will be deducted when an order is created. Confirm the
            customer, quantities, delivery fee and statuses before
            saving.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              !customerId ||
              !hasItems ||
              !validDeliveryFee ||
              isPending
            }
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating Order..." : "Save Order"}
          </button>
        </div>
      </section>
    </form>
  );
}