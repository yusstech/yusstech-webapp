import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { PLANS, getPlanAllowance } from "@/lib/plans";
import { formatDate } from "@/lib/utils";
import {
  ClockIcon,
  CircleDotIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";
import SupportRequestForm from "./SupportRequestForm";

export default async function SupportPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!user) redirect("/onboarding");

  const [{ data: subscription }, { data: requests }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", userId).single(),
    supabase
      .from("support_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!subscription) redirect("/onboarding");

  const plan = PLANS[subscription.plan];
  const allowance = getPlanAllowance(subscription.plan);
  const used = subscription.requests_used_this_month;
  const remaining = allowance >= 999 ? null : allowance - used;
  const canSubmit = remaining === null || remaining > 0;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Support</h1>
          <p className="text-neutral-500 mt-1 text-sm">
            {remaining !== null
              ? `${remaining} of ${allowance} request${allowance !== 1 ? "s" : ""} remaining this month`
              : "Unlimited requests on your plan"}
          </p>
        </div>
      </div>

      {/* Submit form */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6">
        <h2 className="font-medium mb-4">Submit a request</h2>
        {canSubmit ? (
          <SupportRequestForm subscriptionId={subscription.id} />
        ) : (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              You&apos;ve used all {allowance} change request
              {allowance !== 1 ? "s" : ""} for this month. Resets on the 1st.
              Need more?{" "}
              <a href="/plan" className="underline font-medium">
                Upgrade your plan
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* Request list */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-medium">Your requests</h2>
        </div>
        {!requests || requests.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-neutral-500">
            No requests yet.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {requests.map((req) => (
              <li key={req.id} className="px-6 py-4 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {req.status === "open" ? (
                    <ClockIcon className="w-4 h-4 text-neutral-400" />
                  ) : req.status === "in_progress" ? (
                    <CircleDotIcon className="w-4 h-4 text-blue-400" />
                  ) : (
                    <CheckCircle2Icon className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{req.title}</div>
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
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {req.category} · Submitted {formatDate(req.created_at)}
                    {req.out_of_scope && (
                      <span className="ml-2 text-amber-600 font-medium">
                        · May require a quote
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1.5 line-clamp-2">
                    {req.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
