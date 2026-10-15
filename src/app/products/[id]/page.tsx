
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Package,
  Pencil,
  Tag,
  Warehouse,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params;
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

  const { data: product, error } = await supabase
    .from("products")
    .select(
      "id, name, sku, description, price, available_units, is_active, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Product details lookup failed:", error.message);
    throw new Error("Unable to load product details.");
  }

  if (!product) {
    notFound();
  }

  const stockIsLow = product.available_units <= 5;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-violet-700"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-700">
                Product Details
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                {product.name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                SKU: {product.sku || "Not assigned"}
              </p>

              <div className="mt-4">
                {product.is_active ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={15} />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                    <XCircle size={15} />
                    Inactive
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/products/${product.id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
            >
              <Pencil size={16} />
              Edit Product
            </Link>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <section className="rounded-xl border border-slate-200 p-5">
              <div className="mb-3 flex items-center gap-2 text-slate-500">
                <CircleDollarSign size={18} />
                <span className="text-sm">Selling Price</span>
              </div>

              <p className="text-2xl font-bold text-slate-900">
                {currency.format(Number(product.price))}
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 p-5">
              <div className="mb-3 flex items-center gap-2 text-slate-500">
                <Warehouse size={18} />
                <span className="text-sm">Available Stock</span>
              </div>

              <p
                className={`text-2xl font-bold ${
                  stockIsLow ? "text-amber-600" : "text-slate-900"
                }`}
              >
                {product.available_units}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  units
                </span>
              </p>

              {stockIsLow && (
                <p className="mt-2 text-xs text-amber-700">
                  Low stock: 5 units or fewer remaining.
                </p>
              )}
            </section>
          </div>

          <div className="space-y-6 border-t border-slate-200 p-6">
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Tag size={17} />
                Description
              </h2>

              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {product.description || "No description provided."}
              </p>
            </section>

            <section className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <CalendarDays size={15} />
                  Date Created
                </p>

                <p className="text-sm text-slate-800">
                  {dateFormatter.format(new Date(product.created_at))}
                </p>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <Package size={15} />
                  Last Updated
                </p>

                <p className="text-sm text-slate-800">
                  {dateFormatter.format(new Date(product.updated_at))}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
