"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Save } from "lucide-react";
import {
  updateProduct,
  type ProductFormState,
} from "@/app/products/actions";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  available_units: number;
  is_active: boolean;
};

type Props = {
  product: Product;
};

const initialState: ProductFormState = { error: "" };

export default function ProductEditForm({ product }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateProduct,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <input type="hidden" name="id" value={product.id} />

      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Product name *
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={150}
          defaultValue={product.name}
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="sku" className="block text-sm font-medium">
            SKU
          </label>
          <input
            id="sku"
            name="sku"
            maxLength={100}
            defaultValue={product.sku ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium">
            Selling price (₦) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min="0"
            max="9999999999.99"
            step="0.01"
            defaultValue={Number(product.price)}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="available_units"
          className="block text-sm font-medium"
        >
          Stock quantity *
        </label>
        <input
          id="available_units"
          name="available_units"
          type="number"
          required
          min="0"
          max="2147483647"
          step="1"
          defaultValue={product.available_units}
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={5000}
          defaultValue={product.description ?? ""}
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={product.is_active}
          className="mt-1 h-4 w-4 accent-violet-700"
        />
        <span>
          <span className="block text-sm font-medium">Active product</span>
          <span className="mt-1 block text-xs text-slate-500">
            Uncheck to mark this product inactive.
          </span>
        </span>
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-slate-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} />
          {isPending ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}