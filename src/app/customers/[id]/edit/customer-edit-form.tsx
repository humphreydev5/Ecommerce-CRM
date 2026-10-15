"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateCustomer } from "@/app/customers/actions";

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
  notes: string | null;
};

const initialState = { error: "" };

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const [state, formAction, isPending] = useActionState(
    updateCustomer,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={customer.id} />

      <div>
        <label htmlFor="full_name" className="text-sm font-medium text-slate-700">
          Full name *
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          maxLength={120}
          defaultValue={customer.full_name}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={254}
            defaultValue={customer.email ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-medium text-slate-700">
            Primary phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            defaultValue={customer.phone ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone_secondary" className="text-sm font-medium text-slate-700">
          Second phone number
        </label>
        <input
          id="phone_secondary"
          name="phone_secondary"
          type="tel"
          maxLength={30}
          defaultValue={customer.phone_secondary ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="address" className="text-sm font-medium text-slate-700">
          Delivery address
        </label>
        <input
          id="address"
          name="address"
          maxLength={300}
          defaultValue={customer.address ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="text-sm font-medium text-slate-700">
            City
          </label>
          <input
            id="city"
            name="city"
            maxLength={100}
            defaultValue={customer.city ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="state" className="text-sm font-medium text-slate-700">
            State
          </label>
          <input
            id="state"
            name="state"
            maxLength={100}
            defaultValue={customer.state ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="country" className="text-sm font-medium text-slate-700">
          Country
        </label>
        <input
          id="country"
          name="country"
          maxLength={100}
          defaultValue={customer.country ?? "Nigeria"}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="notes" className="text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={2000}
          defaultValue={customer.notes ?? ""}
          className={inputClass}
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving changes..." : "Save changes"}
        </button>

        <Link
          href="/customers"
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}