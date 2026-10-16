"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatuses } from "../actions";

type StatusFormProps = {
  orderId: string;
  initialOrderStatus: string;
  initialPaymentStatus: string;
};

const orderStatuses = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
];

const paymentStatuses = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export default function StatusForm({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
}: StatusFormProps) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    startTransition(async () => {
      const result = await updateOrderStatuses(
        orderId,
        orderStatus,
        paymentStatus
      );

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      setSuccessMessage("Order statuses updated successfully.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="order-status"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Order status
        </label>
        <select
          id="order-status"
          value={orderStatus}
          onChange={(event) => setOrderStatus(event.target.value)}
          disabled={isPending}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
        >
          {orderStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="payment-status"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Payment status
        </label>
        <select
          id="payment-status"
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value)}
          disabled={isPending}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
        >
          {paymentStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p role="status" className="text-sm text-green-700">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving changes..." : "Save status changes"}
      </button>

      <p className="text-xs leading-5 text-gray-500">
        Updating statuses does not change product inventory.
      </p>
    </form>
  );
}