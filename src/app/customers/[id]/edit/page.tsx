import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CustomerEditForm } from "./customer-edit-form";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail =
    typeof claimsData?.claims?.email === "string"
      ? claimsData.claims.email.trim().toLowerCase()
      : "";

  if (
    claimsError ||
    !claimsData?.claims ||
    !adminEmail ||
    !userEmail ||
    userEmail !== adminEmail
  ) {
    redirect("/login");
  }

  const { id } = await params;

  const { data: customer, error } = await supabase
    .from("customers")
    .select(
      "id, full_name, email, phone, phone_secondary, address, city, state, country, notes",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Customer lookup failed:", error.message);
    throw new Error("Unable to load this customer.");
  }

  if (!customer) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/customers"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-700"
        >
          <ArrowLeft size={16} />
          Back to customers
        </Link>

        <header className="mb-8">
          <p className="mb-1 text-sm text-slate-500">
            Business workspace / Customers / Edit
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Edit customer
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Update this customer&apos;s contact and delivery information.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <CustomerEditForm customer={customer} />
        </section>
      </div>
    </main>
  );
}