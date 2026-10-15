
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/layout/logout-button";
import { getDashboardSummary } from "@/lib/crm-data";
import {
  ArrowUpRight,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  CircleDollarSign,
  LayoutDashboard,
  MessageCircle,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";


function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const navigation = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Customers", icon: Users, active: false },
  { label: "Products", icon: Package, active: false },
  { label: "Orders", icon: ShoppingBag, active: false },
  { label: "Marketing", icon: MessageCircle, active: false },
  { label: "Reports", icon: ChartNoAxesCombined, active: false },
];

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading dashboard...
        </div>
      }
    >
      <ProtectedDashboard />
    </Suspense>
  );
}

async function ProtectedDashboard() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail =
    typeof data?.claims?.email === "string"
      ? data.claims.email.trim().toLowerCase()
      : "";

  if (
    error ||
    !data?.claims ||
    !adminEmail ||
    !userEmail ||
    userEmail !== adminEmail
  ) {
    redirect("/login");
  }
  const summary = await getDashboardSummary();

const stats = [
  {
    label: "Total revenue",
    value: formatNaira(summary.paidRevenue),
    note: "Revenue from paid orders",
    icon: CircleDollarSign,
  },
  {
    label: "Orders",
    value: summary.orders.toLocaleString("en-NG"),
    note: "Total orders recorded",
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    value: summary.customers.toLocaleString("en-NG"),
    note: "Registered customers",
    icon: Users,
  },
  {
    label: "Products",
    value: summary.products.toLocaleString("en-NG"),
    note: "Products in your catalogue",
    icon: Boxes,
  },
];


  return (
    <div className="min-h-screen md:flex">
      <aside className="flex w-full flex-col bg-[#101a36] text-white md:min-h-screen md:w-64">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7546e8] font-bold">
              CM
            </div>
            <div>
              <p className="font-semibold">Cogent CRM</p>
              <p className="text-xs text-slate-400">Business workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col">
          {navigation.map(({ label, icon: Icon, active }) => (
            <a
              key={label}
              href="#"
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                active
                  ? "bg-[#7546e8] text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 p-3 md:block">
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/10"
          >
            <Settings size={18} />
            Settings
          </a>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-sm text-slate-500">
              Business workspace / Overview
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Your e-commerce business at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Search"
              className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600"
            >
              <Search size={18} />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600"
            >
              <Bell size={18} />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9e1ff] font-semibold text-[#6035cf]">
              A
            </div>
            <LogoutButton />
          </div>
        </header>

        <section className="mb-8 rounded-2xl bg-[#101a36] p-6 text-white sm:p-8">
          <p className="text-sm text-slate-300">Welcome to your workspace</p>
          <h2 className="mt-2 text-2xl font-semibold">
            Everything your store needs, in one place.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Start by configuring your business, then add products,
            customers and orders as each module becomes available.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-slate-200">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            Initial setup · Demo dashboard
          </div>
        </section>

        <section aria-label="Business metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, note, icon: Icon }) => (
            <article
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{label}</p>
                <span className="rounded-xl bg-violet-50 p-2 text-[#7546e8]">
                  <Icon size={19} />
                </span>
              </div>
              <p className="mt-5 text-2xl font-bold">{value}</p>
              <p className="mt-2 text-xs text-slate-500">{note}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">Sales overview</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Revenue performance will appear here.
                </p>
              </div>
              <ChartNoAxesCombined className="text-[#7546e8]" size={22} />
            </div>
            <div className="mt-8 flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
              <p className="font-medium text-slate-700">No sales data yet</p>
              <p className="mt-2 text-sm text-slate-500">
                This chart will use actual orders once the order module is built.
              </p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-semibold">Getting started</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your initial setup checklist
            </p>
            <div className="mt-5 space-y-4">
              {[
                "Set up your project",
                "Connect your database",
                "Configure admin access",
                "Add your first product",
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-[#7546e8]">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm text-slate-600">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
              These are planning items, not interactive setup controls.
            </p>
          </article>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <p>Cogent CRM · Development environment</p>
          <p className="inline-flex items-center gap-1">
            <ArrowUpRight size={13} />
            Initial build
          </p>
        </footer>
      </main>
    </div>
  );
}
