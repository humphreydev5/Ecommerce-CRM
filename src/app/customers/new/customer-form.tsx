
"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createCustomer,
  type CustomerFormState,
} from "@/app/customers/actions";

const initialState: CustomerFormState = { error: "" };

export default function CustomerForm() {
  const [state, formAction, pending] = useActionState(
    createCustomer,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <section>
        <h2 className="mb-4 font-semibold text-slate-900">
          Contact information
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-slate-700">
              Full name *
            </label>
            <input id="full_name" name="full_name" required maxLength={150} autoComplete="name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" placeholder="Enter customer's full name" />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
            <input id="email" name="email" type="email" maxLength={254} autoComplete="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" placeholder="customer@example.com" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">Phone number</label>
            <input id="phone" name="phone" type="tel" maxLength={30} autoComplete="tel" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" placeholder="+234..." />
          </div>

<div>
  <label
    htmlFor="phone_secondary"
    className="mb-2 block text-sm font-medium text-slate-700"
  >
    Alternative phone number
  </label>
  <input
    id="phone_secondary"
    name="phone_secondary"
    type="tel"
    maxLength={30}
    autoComplete="tel"
    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
    placeholder="Alternative phone number"
  />
</div>

        </div>
      </section>

      <section className="border-t border-slate-100 pt-6">
        <h2 className="mb-4 font-semibold text-slate-900">Delivery address</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-700">Street address</label>
            <input id="address" name="address" maxLength={300} autoComplete="street-address" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" placeholder="Street, house number or landmark" />
          </div>
          <div>
            <label htmlFor="city" className="mb-2 block text-sm font-medium text-slate-700">City</label>
            <input id="city" name="city" maxLength={100} autoComplete="address-level2" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div>
            <label htmlFor="state" className="mb-2 block text-sm font-medium text-slate-700">State</label>
            <input id="state" name="state" maxLength={100} autoComplete="address-level1" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="country" className="mb-2 block text-sm font-medium text-slate-700">Country</label>
            <input id="country" name="country" defaultValue="Nigeria" maxLength={100} autoComplete="country-name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 pt-6">
        <label htmlFor="notes" className="mb-2 block font-semibold text-slate-900">Customer notes</label>
        <textarea id="notes" name="notes" rows={4} maxLength={2000} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" placeholder="Preferences, delivery instructions or other useful details..." />
      </section>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
        <Link href="/customers" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </Link>
        <button type="submit" disabled={pending} className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Saving customer..." : "Save customer"}
        </button>
      </div>
    </form>
  );
}
