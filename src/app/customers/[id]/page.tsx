import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Pencil, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomerDetailsPage({
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
      "id, full_name, email, phone, phone_secondary, address, city, state, country, notes, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Customer details lookup failed:", error.message);
    throw new Error("Unable to load this customer's details.");
  }

  if (!customer) {
    notFound();
  }

  const dateFormatter = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });

  const details = [
    { label: "Email address", value: customer.email },
    { label: "Primary phone", value: customer.phone },
    { label: "Second phone number", value: customer.phone_secondary },
    { label: "Delivery address", value: customer.address },
    { label: "City", value: customer.city },
    { label: "State", value: customer.state },
    { label: "Country", value: customer.country },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/customers"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-700"
        >
          <ArrowLeft size={16} />
          Back to customers
        </Link>

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-sm text-slate-500">
              Business workspace / Customers / Profile
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Customer profile
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              View contact details and customer information.
            </p>
          </div>

          <Link
            href={`/customers/${customer.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Pencil size={16} />
            Edit customer
          </Link>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-4 border-b border-slate-100 p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <UserRound size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {customer.full_name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Customer ID: {customer.id}
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            {details.map((detail) => (
              <div key={detail.label}>
                <p className="text-sm text-slate-500">{detail.label}</p>
                <p className="mt-2 break-words font-medium text-slate-900">
                  {detail.value || "Not provided"}
                </p>
              </div>
            ))}

            <div>
              <p className="text-sm text-slate-500">Date added</p>
              <p className="mt-2 font-medium text-slate-900">
                {dateFormatter.format(new Date(customer.created_at))}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Last updated</p>
              <p className="mt-2 font-medium text-slate-900">
                {dateFormatter.format(new Date(customer.updated_at))}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 p-6 sm:p-8">
            <h3 className="font-semibold text-slate-900">Customer notes</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {customer.notes || "No notes have been added for this customer."}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}