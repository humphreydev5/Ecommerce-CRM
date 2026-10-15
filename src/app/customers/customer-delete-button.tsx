"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { deleteCustomer } from "@/app/customers/actions";

type Props = {
  customerId: string;
  customerName: string;
};

const initialState = { error: "", success: false };

export function CustomerDeleteButton({
  customerId,
  customerName,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        aria-label={`Delete ${customerName}`}
        title="Delete customer"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={17} />
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
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-customer-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="delete-customer-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Delete customer?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You are about to delete{" "}
                  <strong>{customerName}</strong>. This cannot be undone.
                  Their existing orders will be retained.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close dialog"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {state.error && (
              <p
                role="alert"
                className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {state.error}
              </p>
            )}

           <form
            action={async (formData) => {
            setIsPending(true);
            setState(initialState);

            try {
                const result = await deleteCustomer(initialState, formData);
                setState(result);

                if (result.success) {
                setIsOpen(false);
                router.refresh();
                }
            } finally {
                setIsPending(false);
            }
            }}
            className="flex flex-wrap justify-end gap-3"
            >
              <input type="hidden" name="id" value={customerId} />

              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Deleting..." : "Yes, delete"}
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}