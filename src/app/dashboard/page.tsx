import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import { formatDate, daysUntil } from "@/lib/utils";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  CheckCircle2Icon,
  CircleDotIcon,
} from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (!user) redirect("/onboarding");

  const [{ data: subscription }, { data: requests }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", userId).single(),
    supabase
      .from("support_requests")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "resolved")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (!subscription) redirect("/onboarding");

  const plan = PLANS[subscription.plan];
  const renewalDays = daysUntil(subscription.next_renewal_date);
  const isOverdue = subscription.status === "overdue";
  const requestsRemaining =
    plan.changeRequestsPerMonth === "unlimited"
      ? null
      : (plan.changeRequestsPerMonth as number) -
        subscription.requests_used_this_month;

  return (
    <div className="p-8 max-w-4xl">
      {/* Welcome banner */}
      {params.welcome === "1" && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2Icon className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800 font-medium">
            Welcome to YusTech! Your subscription is active.
          </p>
        </div>
      )}

      {/* Outgrown banner */}
      {subscription.outgrown && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <ArrowUpCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Your site has grown. You&apos;re hitting the limits of your
                current plan.
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                See what&apos;s waiting for you on the next tier.
              </p>
            </div>
            <Link
              href="/plan"
              className="shrink-0 bg-amber-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              Upgrade now
            </Link>
          </div>
        </div>
      )}

      {/* Overdue banner */}
      {isOverdue && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">
              Your subscription payment failed.
            </p>
            <p className="text-sm text-red-700">
              Update your payment method to keep your site managed.
            </p>
          </div>
          <Link
            href="/billing"
            className="shrink-0 bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Fix payment
          </Link>
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-8">
        Good to have you, {user.name.split(" ")[0]}
      </h1>

      {/* 3 key cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Site status */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Site status
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 animate-pulse" />
            <span className="text-sm text-neutral-600">
              Monitoring coming soon
            </span>
          </div>
          {subscription.site_url && (
            <a
              href={subscription.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 mt-2 block truncate hover:text-neutral-700 transition-colors"
            >
              {subscription.site_url}
            </a>
          )}
        </div>

        {/* Active plan */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Active plan
          </div>
          <div className="font-semibold text-lg">{plan.name}</div>
          <div className="text-sm text-neutral-500">{plan.supportResponse} response</div>
          <Link
            href="/plan"
            className="text-xs text-neutral-400 mt-2 block hover:text-neutral-700 transition-colors"
          >
            View plan details →
          </Link>
        </div>

        {/* Renewal */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Next renewal
          </div>
          <div className="font-semibold text-lg">
            {formatDate(subscription.next_renewal_date)}
          </div>
          <div
            className={`text-sm mt-0.5 ${
              renewalDays <= 7 ? "text-amber-600" : "text-neutral-500"
            }`}
          >
            {renewalDays > 0 ? `${renewalDays} days away` : "Due today"}
          </div>
          <Link
            href="/billing"
            className="text-xs text-neutral-400 mt-2 block hover:text-neutral-700 transition-colors"
          >
            View billing →
          </Link>
        </div>
      </div>

      {/* Open requests */}
      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="font-medium">Open requests</h2>
            {requestsRemaining !== null && (
              <p className="text-xs text-neutral-500 mt-0.5">
                {requestsRemaining} of {plan.changeRequestsPerMonth} remaining
                this month
              </p>
            )}
          </div>
          <Link
            href="/support"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            View all →
          </Link>
        </div>

        {!requests || requests.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-neutral-500">
            No open requests.{" "}
            <Link href="/support" className="text-neutral-700 underline">
              Submit one
            </Link>{" "}
            if you need help.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {requests.map((req) => (
              <li key={req.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="shrink-0">
                  {req.status === "open" ? (
                    <ClockIcon className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <CircleDotIcon className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{req.title}</div>
                  <div className="text-xs text-neutral-500">
                    {req.category} · {formatDate(req.created_at)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    req.status === "open"
                      ? "bg-neutral-100 text-neutral-600"
                      : req.status === "in_progress"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {req.status === "open"
                    ? "Waiting for response"
                    : req.status === "in_progress"
                    ? "In progress"
                    : "Resolved"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
