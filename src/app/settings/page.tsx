
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import BusinessSettingsForm from "./settings-form";

export const dynamic = "force-dynamic";

export default async function BusinessSettingsPage() {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail =
    typeof data?.claims?.email === "string"
      ? data.claims.email.trim().toLowerCase()
      : "";

  if (
    authError ||
    !data?.claims ||
    !adminEmail ||
    !userEmail ||
    userEmail !== adminEmail
  ) {
    redirect("/login");
  }

  const { data: settings, error } = await supabase
    .from("business_settings")
    .select(
      "business_name, currency, timezone, bank_name, bank_account_name, bank_account_number, payment_instructions",
    )
    .eq("id", true)
    .maybeSingle();

  if (error) {
    console.error("Business settings load failed:", error.message);
  }

  if (!settings) {
    return (
      <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-6">
          <h1 className="text-xl font-bold text-slate-900">
            Business Settings
          </h1>
          <p className="mt-3 text-sm text-red-600">
            Unable to load the settings record. Confirm that the initial
            business settings row exists and that your admin account has
            permission to read it.
          </p>
          <Link
            href="/"
            className="mt-5 inline-block text-sm font-medium text-violet-700 hover:underline"
          >
            Return to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-violet-700 hover:underline"
          >
            ← Back to dashboard
          </Link>
          <p className="mt-5 text-sm text-slate-500">
            Business workspace / Settings
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Business Settings
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Manage your company information and payment details used on
            customer invoices.
          </p>
        </header>

        <BusinessSettingsForm
          initialSettings={{
            business_name: settings.business_name ?? "",
            currency: settings.currency ?? "NGN",
            timezone: settings.timezone ?? "Africa/Lagos",
            bank_name: settings.bank_name ?? "",
            bank_account_name: settings.bank_account_name ?? "",
            bank_account_number: settings.bank_account_number ?? "",
            payment_instructions: settings.payment_instructions ?? "",
          }}
        />
      </div>
    </main>
  );
}
