
"use client";

import { useState } from "react";

type InvoiceItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
};

type InvoiceBusinessSettings = {
  business_name: string;
  currency: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  payment_instructions: string;
};

type InvoiceProps = {
  order: {
    id: string;
    order_number: string;
    invoice_number: string;
    customer_name: string;
    customer_phone: string | null;
    delivery_address: string | null;
    subtotal: number | string;
    delivery_fee: number | string;
    total_amount: number | string;
    payment_status: string;
    order_status: string;
    notes: string | null;
    created_at: string;
  };
  items: InvoiceItem[];
  businessSettings: InvoiceBusinessSettings;
};

function formatCurrency(
  amount: number | string,
  currencyCode: string,
) {
  const supportedCurrencies = ["NGN", "USD", "GBP", "EUR"];

  const safeCurrency = supportedCurrencies.includes(currencyCode)
    ? currencyCode
    : "NGN";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function label(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function Invoice({
  order,
  items,
  businessSettings,
}: InvoiceProps) {
  const [printing, setPrinting] = useState(false);

  function printInvoice() {
    const invoice = document.getElementById("printable-invoice");

    if (!invoice) {
      alert("Invoice content could not be found.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      alert("Please allow pop-ups for this site to print the invoice.");
      return;
    }

    setPrinting(true);

    const invoiceCopy = invoice.cloneNode(true) as HTMLElement;
    invoiceCopy.classList.remove("hidden", "print:!block");

    const stylesheetLinks = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    )
      .map((link) => link.outerHTML)
      .join("\n");

    const inlineStyles = Array.from(document.querySelectorAll("style"))
      .map((style) => style.outerHTML)
      .join("\n");

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice ${order.invoice_number}</title>
          ${stylesheetLinks}
          ${inlineStyles}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }

            *, *::before, *::after {
              box-sizing: border-box;
            }

            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              min-height: 0;
              background: #fff;
              color: #111827;
              font-family: Arial, Helvetica, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            #printable-invoice {
              display: block !important;
              position: static !important;
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              visibility: visible !important;
              background: #fff !important;
              color: #111827 !important;
            }

            #printable-invoice * {
              visibility: visible !important;
            }

            #printable-invoice thead {
              display: table-header-group;
            }

            #printable-invoice tr,
            #printable-invoice footer {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            @media screen {
              body {
                padding: 20px;
              }

              #printable-invoice {
                max-width: 194mm !important;
                margin: 0 auto !important;
              }
            }
          </style>
        </head>
        <body></body>
      </html>
    `);
    printWindow.document.close();

    printWindow.document.body.appendChild(invoiceCopy);

    const finishPrinting = () => {
      setPrinting(false);
    };

    printWindow.addEventListener("afterprint", finishPrinting, {
      once: true,
    });

    printWindow.addEventListener(
      "load",
      () => {
        printWindow.focus();

        window.setTimeout(() => {
          printWindow.print();
        }, 500);
      },
      { once: true },
    );
  }

  const hasBankDetails = Boolean(
    businessSettings.bank_name ||
      businessSettings.bank_account_name ||
      businessSettings.bank_account_number ||
      businessSettings.payment_instructions,
  );

  return (
    <>
      <div className="mb-6 flex justify-end print:hidden">
        <button
          type="button"
          onClick={printInvoice}
          disabled={printing}
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {printing ? "Preparing invoice..." : "Print Invoice / Save as PDF"}
        </button>
      </div>

      <section
        id="printable-invoice"
        className="hidden bg-white text-gray-900"
      >
        <header className="border-b-2 border-indigo-900 pb-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-indigo-950">
                {businessSettings.business_name ||
                  "COGENT MULTITECH LIMITED"}
              </h1>
              <p className="mt-1 text-sm font-medium text-gray-600">
                COGENT SHOP
              </p>
              <p className="mt-3 text-sm">Lagos, Nigeria</p>
              <p className="text-sm">Website: www.shop.cogent.com.ng</p>
              <p className="text-sm">Email: shop@cogent.com.ng</p>
              <p className="mt-2 text-xs text-gray-600">
                Company Registration No.: 1877287
              </p>
              <p className="text-xs text-gray-600">
                Tax Identification Number: 24099745-0001
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-extrabold tracking-widest text-indigo-900">
                INVOICE
              </p>
              <p className="mt-3 text-sm text-gray-500">Invoice Number</p>
              <p className="font-bold">{order.invoice_number}</p>
              <p className="mt-2 text-sm text-gray-500">Order Number</p>
              <p className="font-bold">{order.order_number}</p>
              <p className="mt-2 text-sm text-gray-500">Issue Date</p>
              <p className="text-sm font-medium">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-8 py-6">
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              Bill To
            </h2>
            <p className="font-bold">{order.customer_name}</p>
            <p className="mt-1 text-sm">
              {order.customer_phone || "Phone not provided"}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              Delivery Address
            </h2>
            <p className="whitespace-pre-wrap text-sm">
              {order.delivery_address || "No delivery address provided"}
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-8 border-y border-gray-200 py-3 text-sm">
          <p>
            <span className="text-gray-500">Payment: </span>
            <strong>{label(order.payment_status)}</strong>
          </p>
          <p>
            <span className="text-gray-500">Order: </span>
            <strong>{label(order.order_status)}</strong>
          </p>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-indigo-950 text-left text-white">
              <th className="px-3 py-3">Description</th>
              <th className="px-3 py-3 text-right">Unit Price</th>
              <th className="px-3 py-3 text-center">Qty</th>
              <th className="px-3 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="px-3 py-3">{item.product_name}</td>
                <td className="px-3 py-3 text-right">
                  {formatCurrency(item.unit_price, businessSettings.currency)}
                </td>
                <td className="px-3 py-3 text-center">{item.quantity}</td>
                <td className="px-3 py-3 text-right font-medium">
                  {formatCurrency(item.line_total, businessSettings.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-6 w-full max-w-xs space-y-3">
          <div className="flex justify-between gap-4 text-sm">
            <span>Subtotal</span>
            <span>
              {formatCurrency(order.subtotal, businessSettings.currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-sm">
            <span>Delivery Fee</span>
            <span>
              {formatCurrency(order.delivery_fee, businessSettings.currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t-2 border-indigo-900 pt-3 text-lg font-extrabold">
            <span>Total Due</span>
            <span>
              {formatCurrency(order.total_amount, businessSettings.currency)}
            </span>
          </div>
        </div>

        {hasBankDetails && (
          <section className="mt-6 break-inside-avoid rounded-lg border border-gray-200 p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
              Payment Details
            </h2>

            <div className="mt-3 space-y-1 text-sm">
              {businessSettings.bank_name && (
                <p>
                  <span className="text-gray-500">Bank: </span>
                  <strong>{businessSettings.bank_name}</strong>
                </p>
              )}

              {businessSettings.bank_account_name && (
                <p>
                  <span className="text-gray-500">Account Name: </span>
                  <strong>{businessSettings.bank_account_name}</strong>
                </p>
              )}

              {businessSettings.bank_account_number && (
                <p>
                  <span className="text-gray-500">Account Number: </span>
                  <strong>{businessSettings.bank_account_number}</strong>
                </p>
              )}

              {businessSettings.payment_instructions && (
                <p className="whitespace-pre-wrap pt-2">
                  {businessSettings.payment_instructions}
                </p>
              )}
            </div>
          </section>
        )}

        {order.notes && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Notes
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">{order.notes}</p>
          </div>
        )}

        <footer className="mt-12 border-t border-gray-300 pt-6">
          <div className="grid grid-cols-2 items-end gap-10">
            <div>
              <p className="mb-10 text-sm font-semibold">
                Authorized Signature
              </p>
              <div className="w-48 border-b border-gray-500" />
              <p className="mt-2 text-xs text-gray-500">
                Authorized representative
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Actual signature to be added
              </p>
            </div>

            <div className="flex justify-end">
              <div className="flex h-36 w-36 rotate-[-8deg] flex-col items-center justify-center rounded-full border-[3px] border-indigo-900 p-3 text-center text-indigo-900">
                <p className="text-[9px] font-bold tracking-widest">
                  OFFICIAL BUSINESS STAMP
                </p>
                <div className="my-2 w-full border-t border-indigo-900" />
                <p className="text-xs font-extrabold">COGENT MULTITECH</p>
                <p className="text-xs font-extrabold">LIMITED</p>
                <p className="mt-1 text-[9px]">RC 1877287</p>
                <p className="text-[9px]">LAGOS, NIGERIA</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            Thank you for shopping with Cogent Shop.
          </p>
          <p className="mt-1 text-center text-xs text-gray-400">
            This invoice was generated electronically.
          </p>
        </footer>
      </section>
    </>
  );
}
