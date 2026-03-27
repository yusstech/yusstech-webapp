import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { PLANS, formatPrice } from "@/lib/plans";
import { formatDate, daysUntil } from "@/lib/utils";
import { AlertTriangleIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const [{ data: subscription }, { data: invoices }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", userId).single(),
    supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (!subscription) redirect("/onboarding");

  const plan = PLANS[subscription.plan];
  const renewalDays = daysUntil(subscription.next_renewal_date);

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-8">Billing</h1>

      {/* Current subscription */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
              Current subscription
            </div>
            <div className="font-semibold text-lg">{plan.name}</div>
            <div className="text-sm text-neutral-500">WordPress Managed</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-xl">
              {plan.monthlyPrice > 0 ? formatPrice(plan.monthlyPrice) : "—"}
            </div>
            <div className="text-xs text-neutral-400">/month</div>
          </div>
        </div>

        <div className="flex items-center gap-4 py-3 border-t border-neutral-100">
          {/* Status */}
          <div className="flex items-center gap-1.5 text-sm">
            {subscription.status === "active" ? (
              <>
                <CheckCircle2Icon className="w-4 h-4 text-green-500" />
                <span className="text-green-700 font-medium">Active</span>
              </>
            ) : subscription.status === "overdue" ? (
              <>
                <AlertTriangleIcon className="w-4 h-4 text-red-500" />
                <span className="text-red-700 font-medium">Payment overdue</span>
              </>
            ) : (
              <>
                <ClockIcon className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-600">Cancelled</span>
              </>
            )}
          </div>
          <span className="text-neutral-200">·</span>
          <div className="text-sm text-neutral-600">
            Renews{" "}
            <span
              className={renewalDays <= 7 ? "text-amber-600 font-medium" : ""}
            >
              {formatDate(subscription.next_renewal_date)}
            </span>
            {renewalDays <= 7 && renewalDays > 0 && (
              <span className="text-amber-600"> ({renewalDays}d)</span>
            )}
          </div>
        </div>
      </div>

      {/* Invoice history */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-medium">Payment history</h2>
        </div>
        {!invoices || invoices.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-neutral-500">
            No payments yet.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="px-6 py-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium">
                    {plan.name} Plan
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatDate(inv.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {formatPrice(inv.amount)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      inv.status === "paid"
                        ? "bg-green-50 text-green-700"
                        : inv.status === "failed"
                        ? "bg-red-50 text-red-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
