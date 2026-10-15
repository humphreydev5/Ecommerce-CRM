
import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardSummary() {
  const supabase = await createClient();

  const [
    customersResult,
    productsResult,
    ordersResult,
    paidOrdersResult,
  ] = await Promise.all([
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("products")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "paid"),
  ]);

  const error =
    customersResult.error ??
    productsResult.error ??
    ordersResult.error ??
    paidOrdersResult.error;

  if (error) {
    console.error("Dashboard summary query failed:", error.message);
    throw new Error("Unable to load dashboard summary.");
  }

  const paidRevenue = (paidOrdersResult.data ?? []).reduce(
    (total, order) => total + Number(order.total_amount),
    0,
  );

  return {
    customers: customersResult.count ?? 0,
    products: productsResult.count ?? 0,
    orders: ordersResult.count ?? 0,
    paidRevenue,
  };
}
