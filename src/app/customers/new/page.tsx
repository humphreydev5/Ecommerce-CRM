
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import CustomerForm from "./customer-form";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail =
    typeof data?.claims?.email === "string"
      ? data.claims.email.trim().toLowerCase()
      : "";

  if (
    error ||
    !data?.claims ||
    !adminEmail ||
    !userEmail ||
    userEmail !== adminEmail
  ) {
    redirect("/login");
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
            Customers / Add customer
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Add customer
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Save customer contact and delivery information.
          </p>
        </header>
        <CustomerForm />
      </div>
    </main>
  );
}
