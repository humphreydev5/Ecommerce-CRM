
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2, X } from "lucide-react";
import {
  deleteProduct,
  type DeleteProductState,
} from "@/app/products/actions";

type Props = {
  productId: string;
  productName: string;
};

const initialState: DeleteProductState = {
  error: "",
  success: false,
};

export default function ProductDeleteButton({
  productId,
  productName,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState(initialState);

  async function handleDelete() {
    setIsPending(true);
    setState(initialState);

    try {
      const formData = new FormData();
      formData.set("id", productId);

      const result = await deleteProduct(initialState, formData);
      setState(result);

      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Product deletion request failed:", error);
      setState({
        error: "Something went wrong. Please try again.",
        success: false,
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setState(initialState);
          setIsOpen(true);
        }}
        aria-label={`Delete ${productName}`}
        title="Delete product"
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:border-red-300 hover:bg-red-50"
      >
        <Trash2 size={15} />
        Delete
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPending) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={21} />
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                aria-label="Close confirmation dialog"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="delete-product-title"
              className="text-lg font-bold text-slate-900"
            >
              Delete product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to delete{" "}
              <strong>{productName}</strong>? This action cannot be undone.
            </p>

            {state.error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {state.error}
              </p>
            )}

            {state.success && (
              <p
                role="status"
                className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
              >
                Product deleted successfully.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending || state.success}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
