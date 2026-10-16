
"use client";

import { useActionState } from "react";
import {
  updateBusinessSettings,
  type BusinessSettingsState,
} from "./actions";

type InitialSettings = {
  business_name: string;
  currency: string;
  timezone: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  payment_instructions: string;
};

const initialState: BusinessSettingsState = {
  error: "",
  success: false,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

const labelClass = "block text-sm font-medium text-slate-700";

export default function BusinessSettingsForm({
  initialSettings,
}: {
  initialSettings: InitialSettings;
}) {
  const [state, formAction, isPending] = useActionState(
    updateBusinessSettings,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-slate-900">
          Company Information
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          These details identify your business on invoices.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="business_name" className={labelClass}>
              Business Name
            </label>
            <input
              id="business_name"
              name="business_name"
              type="text"
              required
              maxLength={150}
              defaultValue={initialSettings.business_name}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="currency" className={labelClass}>
              Default Currency
            </label>
            <select
              id="currency"
              name="currency"
              required
              defaultValue={initialSettings.currency}
              className={inputClass}
            >
              <option value="NGN">NGN — Nigerian Naira</option>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>

          <div>
            <label htmlFor="timezone" className={labelClass}>
              Business Timezone
            </label>
            <input
              id="timezone"
              name="timezone"
              type="text"
              required
              maxLength={100}
              defaultValue={initialSettings.timezone}
              placeholder="Africa/Lagos"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Example: Africa/Lagos
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-slate-900">
          Bank & Payment Details
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Add the account customers should use when paying invoices.
          Leave any field blank if it does not apply.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="bank_name" className={labelClass}>
              Bank Name
            </label>
            <input
              id="bank_name"
              name="bank_name"
              type="text"
              maxLength={150}
              defaultValue={initialSettings.bank_name}
              placeholder="Enter bank name"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="bank_account_name" className={labelClass}>
              Account Name
            </label>
            <input
              id="bank_account_name"
              name="bank_account_name"
              type="text"
              maxLength={150}
              defaultValue={initialSettings.bank_account_name}
              placeholder="Enter account holder name"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="bank_account_number" className={labelClass}>
              Account Number
            </label>
            <input
              id="bank_account_number"
              name="bank_account_number"
              type="text"
              maxLength={50}
              autoComplete="off"
              defaultValue={initialSettings.bank_account_number}
              placeholder="Enter bank account number"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="payment_instructions" className={labelClass}>
              Payment Instructions
            </label>
            <textarea
              id="payment_instructions"
              name="payment_instructions"
              rows={4}
              maxLength={2000}
              defaultValue={initialSettings.payment_instructions}
              placeholder="Example: Use your invoice number as the payment reference."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {state.error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          Business settings saved successfully.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          Changes are saved to your CRM database.
        </p>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving settings..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
