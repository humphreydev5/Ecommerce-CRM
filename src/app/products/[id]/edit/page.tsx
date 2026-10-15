import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductEditForm from "./product-edit-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

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
      "id, name, sku, description, price, available_units, is_active"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Product lookup failed:", error.message);
    throw new Error("Unable to load the product.");
  }

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-violet-700"
        >
          <ArrowLeft size={16} />
          Back to products
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Edit product</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update product details and inventory quantity.
          </p>
        </div>

        <ProductEditForm product={product} />
      </div>
    </main>
  );
}