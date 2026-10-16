
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type OrdersPageProps = {
  searchParams: Promise<{
    q?: string;
    payment?: string;
    status?: string;
  }>;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  subtotal: number | string;
  delivery_fee: number | string;
  total_amount: number | string;
  payment_status: string;
  order_status: string;
  created_at: string;
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

function formatStatus(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(value: string) {
  const normalized = value.toLowerCase();

  if (["paid", "delivered", "completed", "fulfilled"].includes(normalized)) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    ["cancelled", "canceled", "failed", "refunded"].includes(normalized)
  ) {
    return "bg-red-50 text-red-700";
  }

  if (
    ["pending", "processing", "partially_paid"].includes(normalized)
  ) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
}

export default async function OrdersPage({
  searchParams,
}: OrdersPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const paymentFilter = params.payment ?? "";
  const orderFilter = params.status ?? "";

  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const email = claimsData?.claims?.email;

  if (
    claimsError ||
    !email ||
    email.toLowerCase() !==
      process.env.ADMIN_EMAIL?.trim().toLowerCase()
  ) {
    redirect("/login");
  }

  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, subtotal, delivery_fee, total_amount, payment_status, order_status, created_at"
    )
    .order("created_at", { ascending: false });

  if (query) {
    const safeQuery = query.replace(/[,%()]/g, " ");
    ordersQuery = ordersQuery.or(
      `order_number.ilike.%${safeQuery}%,customer_name.ilike.%${safeQuery}%,customer_phone.ilike.%${safeQuery}%`
    );
  }

  if (paymentFilter) {
    ordersQuery = ordersQuery.eq("payment_status", paymentFilter);
  }

  if (orderFilter) {
    ordersQuery = ordersQuery.eq("order_status", orderFilter);
  }

  const { data, error } = await ordersQuery;

  if (error) {
    console.error("Orders query failed:", error.message);
    throw new Error("Unable to load orders. Please try again.");
  }

  const orders = (data ?? []) as Order[];

  const { data: statusRows, error: statusError } = await supabase
    .from("orders")
    .select("payment_status, order_status");

  if (statusError) {
    console.error("Order status lookup failed:", statusError.message);
    throw new Error("Unable to load order filters. Please try again.");
  }

  const paymentStatuses = [
    ...new Set((statusRows ?? []).map((row) => row.payment_status)),
  ].sort();

  const orderStatuses = [
    ...new Set((statusRows ?? []).map((row) => row.order_status)),
  ].sort();

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-violet-700"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

                <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Orders</h1>
              <p className="mt-1 text-sm text-slate-500">
                Review customer orders, payments, and fulfilment.
              </p>
            </div>
          </div>

          <Link
            href="/orders/new"
            className="inline-flex items-center justify-center rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-800"
          >
            + Add Order
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <form
            action="/orders"
            method="GET"
            className="mb-6 grid gap-3 md:grid-cols-4"
          >
            <div className="relative md:col-span-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search order number, customer, or phone..."
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <select
              name="payment"
              defaultValue={paymentFilter}
              className="rounded-lg border border-slate-300 px-3 py-3 text-sm focus:border-violet-500 focus:outline-none"
            >
              <option value="">All payment statuses</option>
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>

            <select
              name="status"
              defaultValue={orderFilter}
              className="rounded-lg border border-slate-300 px-3 py-3 text-sm focus:border-violet-500 focus:outline-none"
            >
              <option value="">All order statuses</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-3 md:col-span-4">
              <button
                type="submit"
                className="rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800"
              >
                Apply filters
              </button>

              <Link
                href="/orders"
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </Link>
            </div>
          </form>

          <div className="mb-4 text-sm text-slate-500">
            {orders.length} order{orders.length === 1 ? "" : "s"} found
          </div>

          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-16 text-center">
              <ClipboardList
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />
              <h2 className="font-semibold text-slate-800">
                No orders found
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Orders will appear here when they are available.
                Try clearing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-3 font-semibold">Order</th>
                    <th className="px-3 py-3 font-semibold">Customer</th>
                    <th className="px-3 py-3 font-semibold">Total</th>
                    <th className="px-3 py-3 font-semibold">Payment</th>
                    <th className="px-3 py-3 font-semibold">Order status</th>
                    <th className="px-3 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                      <td className="px-3 py-4">
                        <p className="font-medium text-slate-900">
                          {order.customer_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.customer_phone || "No phone recorded"}
                        </p>
                      </td>
                      <td className="px-3 py-4 font-semibold">
                        {currency.format(Number(order.total_amount))}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(order.payment_status)}`}
                        >
                          {formatStatus(order.payment_status)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(order.order_status)}`}
                        >
                          {formatStatus(order.order_status)}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {new Intl.DateTimeFormat("en-NG", {
                          dateStyle: "medium",
                        }).format(new Date(order.created_at))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
