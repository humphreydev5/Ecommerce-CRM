
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Search, Users, ArrowLeft, Eye, Pencil } from "lucide-react";
import { CustomerDeleteButton } from "./customer-delete-button";

export const dynamic = "force-dynamic";

type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  phone_secondary: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
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

  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  let customerQuery = supabase
    .from("customers")
    .select(
      "id, full_name, email, phone, phone_secondary, address, city, state, country, created_at",
    )
    .order("created_at", { ascending: false });

  if (query) {
    const safeQuery = query.replace(/[,%()]/g, " ");
    customerQuery = customerQuery.or(
      `full_name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,phone.ilike.%${safeQuery}%,phone_secondary.ilike.%${query}`,
    );
  }

  const { data, error } = await customerQuery;
  const customers = (data ?? []) as Customer[];

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-700"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-sm text-slate-500">
              Business workspace / Customers
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Customers
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage customer information and delivery details.
            </p>
          </div>

          <Link
            href="/customers/new"
            className="inline-flex items-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Add customer
          </Link>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Customers found</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {error ? "—" : customers.length}
            </p>
          </article>

          <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Users size={22} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Customer directory
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Search contact and location details.
              </p>
            </div>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <form action="/customers" method="get" className="border-b border-slate-100 p-4">
            <label htmlFor="customer-search" className="sr-only">
              Search customers
            </label>
            <div className="flex max-w-xl items-center gap-3 rounded-xl border border-slate-200 px-4">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                id="customer-search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search name, email or phone..."
                className="w-full py-3 text-sm outline-none"
              />
              <button
                type="submit"
                className="text-sm font-semibold text-violet-700"
              >
                Search
              </button>
            </div>
          </form>
          {query && (
            <div className="border-b border-slate-100 px-4 py-3">
                <Link
                href="/customers"
                className="text-sm font-medium text-violet-700 hover:text-violet-900"
                >
                View all customers
                </Link>
            </div>
            )}

          {error ? (
            <div role="alert" className="p-8 text-center">
              <p className="font-semibold text-red-600">
                Unable to load customers
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Check your database connection and access policies, then refresh.
              </p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <Users size={22} />
              </div>
              <h2 className="font-semibold text-slate-900">
                {query ? "No matching customers" : "No customers yet"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {query
                  ? "Try a different name, email or phone number."
                  : "Add your first customer to start building your directory."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Customer</th>
                    <th className="px-5 py-4 font-medium">Phone</th>
                    <th className="px-5 py-4 font-medium">Location</th>
                    <th className="px-5 py-4 font-medium">Date added</th>
                    <th className="px-5 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {customer.full_name}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {customer.email || "No email"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                    <div className="space-y-1">
                        <p>{customer.phone || "—"}</p>
                        {customer.phone_secondary && (
                        <p className="text-sm text-slate-400">
                            Second: {customer.phone_secondary}
                        </p>
                        )}
                    </div>
                    </td>
                      <td className="px-5 py-4 text-slate-600">
                        {[customer.city, customer.state, customer.country]
                          .filter(Boolean)
                          .join(", ") || customer.address || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {new Intl.DateTimeFormat("en-NG", {
                          dateStyle: "medium",
                          timeZone: "Africa/Lagos",
                        }).format(new Date(customer.created_at))}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Link
                            href={`/customers/${customer.id}`}
                            aria-label={`View ${customer.full_name}`}
                            title="View customer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                            >
                            <Eye size={17} />
                            </Link>

                            <Link
                            href={`/customers/${customer.id}/edit`}
                            aria-label={`Edit ${customer.full_name}`}
                            title="Edit customer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                            <Pencil size={17} />
                            </Link>
                            <CustomerDeleteButton
                            customerId={customer.id}
                            customerName={customer.full_name}
                            />
                        </div>
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
