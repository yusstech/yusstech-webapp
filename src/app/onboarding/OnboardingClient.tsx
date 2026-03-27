"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { PLANS, PLAN_ORDER, formatPrice } from "@/lib/plans";
import type { Plan } from "@/types/database";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Step = "plan" | "details" | "payment" | "confirmation";

interface FormData {
  plan: Plan | null;
  businessName: string;
  siteUrl: string;
}

export default function OnboardingClient() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<Step>("plan");
  const [formData, setFormData] = useState<FormData>({
    plan: null,
    businessName: "",
    siteUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: Step[] = ["plan", "details", "payment", "confirmation"];
  const stepLabels = ["Choose plan", "Your details", "Payment", "Done"];
  const currentStepIndex = steps.indexOf(step);

  async function handlePayment() {
    if (!formData.plan || !user) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: formData.plan,
          businessName: formData.businessName,
          siteUrl: formData.siteUrl,
          email: user.primaryEmailAddress?.emailAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      // Redirect to Paystack checkout
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment initiation failed");
      setLoading(false);
    }
  }

  if (step === "confirmation") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">You&apos;re all set</h1>
          <p className="text-neutral-600 mb-8">
            Your subscription is active. Head to your dashboard to see your
            plan details and site status.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors w-full"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight hover:opacity-70 transition-opacity">
            YusTech
          </Link>
          {user && (
            <SignOutButton redirectUrl="/">
              <button className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
                Sign out
              </button>
            </SignOutButton>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-2 mb-10">
          {steps.slice(0, -1).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  i < currentStepIndex
                    ? "bg-neutral-900 text-white"
                    : i === currentStepIndex
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-200 text-neutral-500"
                )}
              >
                {i < currentStepIndex ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-sm hidden sm:block",
                  i === currentStepIndex
                    ? "text-neutral-900 font-medium"
                    : "text-neutral-500"
                )}
              >
                {stepLabels[i]}
              </span>
              {i < steps.length - 2 && (
                <ChevronRightIcon className="w-4 h-4 text-neutral-300 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step: Plan Selection */}
        {step === "plan" && (
          <div>
            <h1 className="text-2xl font-semibold mb-2">Choose your plan</h1>
            <p className="text-neutral-600 mb-8">
              All plans include monthly reports and WordPress management.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {PLAN_ORDER.map((planId) => {
                const plan = PLANS[planId];
                const isSelected = formData.plan === planId;
                return (
                  <button
                    key={planId}
                    onClick={() => setFormData((f) => ({ ...f, plan: planId }))}
                    className={cn(
                      "rounded-xl border p-5 bg-white text-left flex flex-col gap-3 transition-all",
                      isSelected
                        ? "border-neutral-900 ring-2 ring-neutral-900"
                        : "border-neutral-200 hover:border-neutral-400"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{plan.name}</div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {plan.tagline}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                          isSelected
                            ? "border-neutral-900 bg-neutral-900"
                            : "border-neutral-300"
                        )}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="text-xl font-bold">
                      {plan.monthlyPrice > 0
                        ? formatPrice(plan.monthlyPrice)
                        : "TBD"}
                      {plan.monthlyPrice > 0 && (
                        <span className="text-xs font-normal text-neutral-500">
                          /mo
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5 text-xs text-neutral-600">
                      <li>↳ {plan.backups} backups</li>
                      <li>↳ {plan.supportResponse} response</li>
                      <li>
                        ↳{" "}
                        {plan.changeRequestsPerMonth === "unlimited"
                          ? "Unlimited"
                          : plan.changeRequestsPerMonth}{" "}
                        change req/mo
                      </li>
                    </ul>
                  </button>
                );
              })}
            </div>
            <button
              disabled={!formData.plan}
              onClick={() => setStep("details")}
              className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && (
          <div className="max-w-md">
            <h1 className="text-2xl font-semibold mb-2">Your details</h1>
            <p className="text-neutral-600 mb-8">
              Tell us about your business and site.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Business name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      businessName: e.target.value,
                    }))
                  }
                  placeholder="Acme Ltd"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.siteUrl}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, siteUrl: e.target.value }))
                  }
                  placeholder="https://yoursite.com"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep("plan")}
                className="border border-neutral-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Back
              </button>
              <button
                disabled={!formData.businessName || !formData.siteUrl}
                onClick={() => setStep("payment")}
                className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step: Payment */}
        {step === "payment" && formData.plan && (
          <div className="max-w-md">
            <h1 className="text-2xl font-semibold mb-2">Review & pay</h1>
            <p className="text-neutral-600 mb-8">
              Confirm your plan and proceed to payment.
            </p>
            <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold">
                    {PLANS[formData.plan].name} Plan
                  </div>
                  <div className="text-sm text-neutral-500">
                    WordPress Managed · Monthly
                  </div>
                </div>
                <div className="font-semibold">
                  {PLANS[formData.plan].monthlyPrice > 0
                    ? formatPrice(PLANS[formData.plan].monthlyPrice)
                    : "TBD"}
                  <span className="text-xs font-normal text-neutral-500">
                    /mo
                  </span>
                </div>
              </div>
              <div className="border-t border-neutral-100 pt-4 space-y-1.5 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <span>Business</span>
                  <span>{formData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Site</span>
                  <span className="text-right max-w-[180px] truncate">
                    {formData.siteUrl}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email</span>
                  <span>{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setStep("details")}
                className="border border-neutral-300 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60"
              >
                {loading ? "Redirecting to payment…" : "Pay with Paystack"}
              </button>
            </div>
            <p className="text-xs text-neutral-400 mt-3">
              Payments are processed securely by Paystack. Auto-renews monthly.
              Cancel any time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
