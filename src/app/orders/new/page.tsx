
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import OrderForm from "./order-form";

export default async function NewOrderPage() {
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

  const [{ data: customers, error: customersError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, full_name, phone, phone_secondary, address, city, state, country")
        .order("full_name", { ascending: true }),
      supabase
        .from("products")
        .select("id, name, sku, price, available_units, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);

  if (customersError || productsError) {
    throw new Error("Unable to load customers or products for this order.");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
              Create Order
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a customer, select products, and prepare the order.
            </p>
          </div>
        </div>

        <OrderForm
          customers={customers ?? []}
          products={products ?? []}
        />
      </div>
    </main>
  );
}