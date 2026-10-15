import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductDeleteButton from "./product-delete-button";
import {
  ArrowLeft,
  Package,
  Plus,
  Search,
  Pencil,
} from "lucide-react";

type ProductsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const email = claimsData?.claims?.email;

  if (
    !email ||
    email.toLowerCase() !==
      process.env.ADMIN_EMAIL?.trim().toLowerCase()
  ) {
    redirect("/login");
  }

  let productsQuery = supabase
    .from("products")
    .select(
      "id, name, sku, description, price, available_units, is_active, created_at"
    )
    .order("created_at", { ascending: false });

  if (query) {
    const safeQuery = query.replace(/[,%()]/g, " ");
    productsQuery = productsQuery.or(
      `name.ilike.%${safeQuery}%,sku.ilike.%${safeQuery}%`
    );
  }

  const { data: products, error } = await productsQuery;

  if (error) {
    console.error("Products query failed:", error.message);
    throw new Error("Unable to load products. Please try again.");
  }

  const formatCurrency = (amount: number | string) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(Number(amount));

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

        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Products</h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your product catalogue and stock.
              </p>
            </div>
          </div>

          <Link
            href="/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800"
          >
            <Plus size={18} />
            Add product
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <form
            action="/products"
            method="GET"
            className="mb-6 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search by product name or SKU..."
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-slate-50"
            >
              Search
            </button>
          </form>

          <div className="mb-4 text-sm text-slate-500">
            {products.length} product{products.length === 1 ? "" : "s"} found
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-16 text-center">
              <Package
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />
              <h2 className="font-semibold text-slate-800">
                {query ? "No matching products" : "No products yet"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {query
                  ? "Try a different product name or SKU."
                  : "Add your first product to start building your catalogue."}
              </p>
              {!query && (
                <Link
                  href="/products/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
                >
                  <Plus size={16} />
                  Add your first product
                </Link>
              )}
              {query && (
                <Link
                  href="/products"
                  className="mt-5 inline-block text-sm font-medium text-violet-700 hover:underline"
                >
                  View all products
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-3 font-semibold">Product</th>
                    <th className="px-3 py-3 font-semibold">SKU</th>
                    <th className="px-3 py-3 font-semibold">Price</th>
                    <th className="px-3 py-3 font-semibold">Stock</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-3 py-4">
                        <div className="font-medium text-slate-900">
                          {product.name}
                        </div>
                        {product.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {product.description}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        {product.sku || "—"}
                      </td>
                      <td className="px-3 py-4 font-medium">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={
                            product.available_units <= 5
                              ? "font-semibold text-amber-700"
                              : "text-slate-700"
                          }
                        >
                          {product.available_units}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={
                            product.is_active
                              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                              : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                        <Link
                            href={`/products/${product.id}`}
                            aria-label={`View ${product.name}`}
                            title="View product"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-violet-300 hover:text-violet-700"
                        >
                            View
                        </Link>

                        <Link
                            href={`/products/${product.id}/edit`}
                            aria-label={`Edit ${product.name}`}
                            title="Edit product"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-violet-300 hover:text-violet-700"
                        >
                            <Pencil size={15} />
                            Edit
                        </Link>
                        <ProductDeleteButton
                        productId={product.id}
                        productName={product.name}
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