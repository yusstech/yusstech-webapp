import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { PLANS, PLAN_ORDER, getNextPlan, formatPrice } from "@/lib/plans";
import { CheckIcon, MinusIcon } from "lucide-react";
import Link from "next/link";

export default async function PlanPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!subscription) redirect("/onboarding");

  const currentPlan = PLANS[subscription.plan];
  const nextPlanId = getNextPlan(subscription.plan);
  const nextPlan = nextPlanId ? PLANS[nextPlanId] : null;

  const featureRows = [
    { label: "Backups", key: "backups" as const },
    { label: "Plugin updates", key: "pluginUpdates" as const },
    { label: "Support response", key: "supportResponse" as const },
    {
      label: "Change requests/mo",
      render: (plan: typeof currentPlan) =>
        plan.changeRequestsPerMonth === "unlimited"
          ? "Unlimited"
          : String(plan.changeRequestsPerMonth),
    },
    {
      label: "Dev hours included",
      render: (plan: typeof currentPlan) =>
        plan.devHoursIncluded === 0 ? null : `${plan.devHoursIncluded} hr`,
    },
    {
      label: "Direct messaging",
      render: (plan: typeof currentPlan) => (plan.directMessaging ? true : null),
    },
    { label: "Monthly report", key: "monthlyReport" as const },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Your plan</h1>
        <p className="text-neutral-500 mt-1">
          Currently on{" "}
          <span className="font-medium text-neutral-900">{currentPlan.name}</span>
        </p>
      </div>

      {/* Current plan details */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-semibold text-lg">{currentPlan.name}</div>
            <div className="text-sm text-neutral-500">{currentPlan.tagline}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-xl">
              {currentPlan.monthlyPrice > 0
                ? formatPrice(currentPlan.monthlyPrice)
                : "—"}
            </div>
            <div className="text-xs text-neutral-400">/month</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Backups", currentPlan.backups],
            ["Plugin updates", currentPlan.pluginUpdates],
            ["Support response", currentPlan.supportResponse],
            [
              "Change requests/mo",
              currentPlan.changeRequestsPerMonth === "unlimited"
                ? "Unlimited"
                : currentPlan.changeRequestsPerMonth,
            ],
            [
              "Dev hours",
              currentPlan.devHoursIncluded === 0
                ? "None"
                : `${currentPlan.devHoursIncluded} hr`,
            ],
            [
              "Direct messaging",
              currentPlan.directMessaging ? "Included" : "Not included",
            ],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-center justify-between py-2 border-b border-neutral-50">
              <span className="text-neutral-500">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next tier comparison */}
      {nextPlan && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-amber-600 mb-1">
                Next tier
              </div>
              <div className="font-semibold text-lg">{nextPlan.name}</div>
              <div className="text-sm text-neutral-600">{nextPlan.tagline}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-xl">
                {nextPlan.monthlyPrice > 0
                  ? formatPrice(nextPlan.monthlyPrice)
                  : "—"}
              </div>
              <div className="text-xs text-neutral-400">/month</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            {[
              ["Backups", nextPlan.backups, currentPlan.backups],
              ["Plugin updates", nextPlan.pluginUpdates, currentPlan.pluginUpdates],
              ["Support response", nextPlan.supportResponse, currentPlan.supportResponse],
            ]
              .filter(([, next, curr]) => next !== curr)
              .map(([label, next]) => (
                <div key={label as string} className="flex items-center gap-2 text-amber-800">
                  <CheckIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <span className="font-medium">{next}</span>{" "}
                    {(label as string).toLowerCase()}
                  </span>
                </div>
              ))}
          </div>
          <Link
            href="/billing"
            className="inline-block bg-amber-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Upgrade to {nextPlan.name}
          </Link>
        </div>
      )}

      {/* All plans comparison */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-medium">All plans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider w-40">
                  Feature
                </th>
                {PLAN_ORDER.map((p) => (
                  <th
                    key={p}
                    className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                      p === subscription.plan
                        ? "text-neutral-900 bg-neutral-50"
                        : "text-neutral-400"
                    }`}
                  >
                    {PLANS[p].name}
                    {p === subscription.plan && (
                      <span className="block text-[10px] normal-case font-normal text-neutral-500">
                        current
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {featureRows.map(({ label, key, render }) => (
                <tr key={label}>
                  <td className="px-6 py-3 text-neutral-600">{label}</td>
                  {PLAN_ORDER.map((p) => {
                    const plan = PLANS[p];
                    const value = render
                      ? render(plan)
                      : key
                      ? plan[key]
                      : null;
                    return (
                      <td
                        key={p}
                        className={`px-4 py-3 text-center ${
                          p === subscription.plan ? "bg-neutral-50" : ""
                        }`}
                      >
                        {value === true ? (
                          <CheckIcon className="w-4 h-4 text-neutral-600 mx-auto" />
                        ) : value === null ? (
                          <MinusIcon className="w-3 h-3 text-neutral-300 mx-auto" />
                        ) : (
                          <span className="text-neutral-700">{value as string}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
