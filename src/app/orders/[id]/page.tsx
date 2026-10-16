
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StatusForm from "./status-form";
import Invoice from "./invoice";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  MapPin,
  Package,
  Phone,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type OrderDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

function formatStatus(status: string) {
  return status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusClass(status: string) {
  const value = status.toLowerCase();

  if (
    ["paid", "delivered", "completed", "fulfilled"].includes(value)
  ) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (
    ["cancelled", "canceled", "failed", "refunded"].includes(value)
  ) {
    return "bg-red-100 text-red-700";
  }

  if (
    ["pending", "processing", "partially_paid"].includes(value)
  ) {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-gray-100 text-gray-700";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { id } = await params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    )
  ) {
    notFound();
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
    redirect("/login");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, invoice_number, customer_id, customer_name, customer_phone, delivery_address, subtotal, delivery_fee, total_amount, payment_status, order_status, notes, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    throw new Error("Unable to load this order.");
  }

  if (!order) {
    notFound();
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(
      "id, order_id, product_id, product_name, quantity, unit_price, line_total, created_at"
    )
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new Error("Unable to load the items for this order.");
  }

  const { data: businessSettings, error: settingsError } = await supabase
  .from("business_settings")
  .select(
    "business_name, currency, bank_name, bank_account_name, bank_account_number, payment_instructions",
  )
  
  .eq("id", true)
  .maybeSingle();

if (settingsError) {
  throw new Error("Unable to load business settings for this invoice.");
}

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                <ClipboardList size={24} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Order Details</p>
                <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  {order.order_number}
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Created {formatDate(order.created_at)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusClass(order.payment_status)}`}
            >
              Payment: {formatStatus(order.payment_status)}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusClass(order.order_status)}`}
            >
              Order: {formatStatus(order.order_status)}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-950">
                  Items Ordered
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Package
                    size={32}
                    className="mx-auto mb-3 text-gray-400"
                  />
                  <p className="font-medium text-gray-700">
                    No items found for this order.
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-5 py-3 font-medium">
                            Product
                          </th>
                          <th className="px-5 py-3 text-right font-medium">
                            Unit Price
                          </th>
                          <th className="px-5 py-3 text-center font-medium">
                            Quantity
                          </th>
                          <th className="px-5 py-3 text-right font-medium">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-5 py-4">
                              <p className="font-medium text-gray-950">
                                {item.product_name}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-right text-gray-600">
                              {currency.format(Number(item.unit_price))}
                            </td>

                            <td className="px-5 py-4 text-center text-gray-600">
                              {item.quantity}
                            </td>

                            <td className="px-5 py-4 text-right font-medium text-gray-950">
                              {currency.format(Number(item.line_total))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
                    <div className="ml-auto max-w-sm space-y-3">
                      <div className="flex justify-between gap-4 text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>{currency.format(Number(order.subtotal))}</span>
                      </div>

                      <div className="flex justify-between gap-4 text-sm text-gray-600">
                        <span>Delivery Fee</span>
                        <span>
                          {currency.format(Number(order.delivery_fee))}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-base font-bold text-gray-950">
                        <span>Order Total</span>
                        <span>
                          {currency.format(Number(order.total_amount))}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-gray-950">
                Order Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {order.order_number}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {formatDate(order.updated_at)}
                  </p>
                </div>
              </div>
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                    Manage order status
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                    Update the order progress and payment status.
                    </p>
                </div>

                <StatusForm
                    orderId={order.id}
                    initialOrderStatus={order.order_status}
                    initialPaymentStatus={order.payment_status}
                />
                </section>

              {order.notes && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500">Order Notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-5 font-semibold text-gray-950">
                Customer Details
              </h2>

              <div className="flex items-start gap-3">
                <UserRound
                  size={19}
                  className="mt-0.5 shrink-0 text-gray-400"
                />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Customer Name</p>
                  <p className="mt-1 break-words font-medium text-gray-900">
                    {order.customer_name}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3">
                <Phone
                  size={19}
                  className="mt-0.5 shrink-0 text-gray-400"
                />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Phone Number</p>
                  {order.customer_phone ? (
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="mt-1 block break-words font-medium text-indigo-700 hover:underline"
                    >
                      {order.customer_phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">
                      Not provided
                    </p>
                  )}
                </div>
              </div>

              {order.customer_id && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <Link
                    href={`/customers/${order.customer_id}`}
                    className="text-sm font-medium text-indigo-700 hover:underline"
                  >
                    View Customer Profile
                  </Link>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-5 font-semibold text-gray-950">
                Delivery Details
              </h2>

              <div className="flex items-start gap-3">
                <MapPin
                  size={19}
                  className="mt-0.5 shrink-0 text-gray-400"
                />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Delivery Address</p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-800">
                    {order.delivery_address || "No delivery address provided"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3">
                <CalendarDays
                  size={19}
                  className="mt-0.5 shrink-0 text-gray-400"
                />
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="mt-1 text-sm text-gray-800">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
      <div className="print:hidden">
        {/* The existing order details UI is above. */}
      </div>

        <Invoice
        order={order}
        items={items}
        businessSettings={{
            business_name: businessSettings?.business_name ?? "COGENT MULTITECH LIMITED",
            currency: businessSettings?.currency ?? "NGN",
            bank_name: businessSettings?.bank_name ?? "",
            bank_account_name: businessSettings?.bank_account_name ?? "",
            bank_account_number: businessSettings?.bank_account_number ?? "",
            payment_instructions: businessSettings?.payment_instructions ?? "",
            }}
        />
    </main>
  );
}