import { createServiceClient } from "@/lib/supabase/server";
import { PLANS, formatPrice } from "@/lib/plans";
import { formatDate, daysUntil } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangleIcon, UsersIcon, TrendingUpIcon } from "lucide-react";

export default async function AdminOverviewPage() {
  const supabase = createServiceClient();

  const [{ data: users }, { data: subscriptions }, { data: requests }] =
    await Promise.all([
      supabase.from("users").select("*").eq("role", "client"),
      supabase.from("subscriptions").select("*"),
      supabase
        .from("support_requests")
        .select("*")
        .neq("status", "resolved"),
    ]);

  const activeCount =
    subscriptions?.filter((s) => s.status === "active").length ?? 0;
  const overdueCount =
    subscriptions?.filter((s) => s.status === "overdue").length ?? 0;
  const outgrownCount =
    subscriptions?.filter((s) => s.outgrown).length ?? 0;
  const openRequestCount = requests?.length ?? 0;

  // MRR estimate
  const mrr =
    subscriptions
      ?.filter((s) => s.status === "active")
      .reduce((sum, s) => sum + PLANS[s.plan].monthlyPrice, 0) ?? 0;

  // Clients renewing in next 7 days
  const renewingSoon = subscriptions?.filter((s) => {
    const days = daysUntil(s.next_renewal_date);
    return days >= 0 && days <= 7;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-8">Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: "Active clients",
            value: activeCount,
            icon: UsersIcon,
          },
          {
            label: "MRR",
            value: mrr > 0 ? formatPrice(mrr) : "—",
            icon: TrendingUpIcon,
          },
          {
            label: "Overdue",
            value: overdueCount,
            icon: AlertTriangleIcon,
            alert: overdueCount > 0,
          },
          {
            label: "Open requests",
            value: openRequestCount,
            icon: null,
          },
        ].map(({ label, value, alert }) => (
          <div
            key={label}
            className={`bg-white border rounded-xl p-5 ${
              alert ? "border-red-200" : "border-neutral-200"
            }`}
          >
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
              {label}
            </div>
            <div
              className={`text-2xl font-bold ${
                alert ? "text-red-600" : "text-neutral-900"
              }`}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Renewing soon */}
      {renewingSoon && renewingSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <h2 className="font-medium text-amber-900 mb-3">
            Renewing in next 7 days
          </h2>
          <ul className="space-y-2">
            {renewingSoon.map((sub) => {
              const user = users?.find((u) => u.id === sub.user_id);
              return (
                <li
                  key={sub.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-amber-800">
                    {user?.name ?? "Unknown"} — {PLANS[sub.plan].name}
                  </span>
                  <span className="text-amber-700 font-medium">
                    {formatDate(sub.next_renewal_date)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/clients"
          className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-400 transition-colors"
        >
          <div className="font-medium mb-1">All clients</div>
          <div className="text-sm text-neutral-500">
            {users?.length ?? 0} total
          </div>
        </Link>
        <Link
          href="/admin/requests"
          className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-400 transition-colors"
        >
          <div className="font-medium mb-1">Open requests</div>
          <div className="text-sm text-neutral-500">
            {openRequestCount} unresolved
          </div>
        </Link>
        <Link
          href="/admin/payment-links"
          className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-neutral-400 transition-colors"
        >
          <div className="font-medium mb-1">Payment links</div>
          <div className="text-sm text-neutral-500">Personalized renewal invoices</div>
        </Link>
      </div>
    </div>
  );
}
