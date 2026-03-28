"use client";

import { useState, useRef } from "react";
import { CheckIcon, StarIcon, AlertTriangleIcon, ArrowUpIcon, UploadIcon } from "lucide-react";
import type { PaymentLinkPlan, PaymentLinkRow } from "@/types/database";

function formatNGN(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

const BANK_DETAILS = {
  bankName: "Taj Bank",
  accountNumber: "0010808411",
  accountName: "Yustech Softweb",
};

export default function PaymentClient({ link }: { link: PaymentLinkRow }) {
  const plans = link.plans as PaymentLinkPlan[];
  const currentPlan = plans.find((p) => p.is_current);

  const [selected, setSelected] = useState<string>(
    currentPlan?.id ?? plans[0].id
  );
  const [senderName, setSenderName] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPlan = plans.find((p) => p.id === selected)!;

  const currentIdx = currentPlan ? plans.indexOf(currentPlan) : -1;
  const selectedIdx = plans.indexOf(selectedPlan);
  const isDowngrade = currentIdx !== -1 && selectedIdx < currentIdx;
  const recommendedPlans = plans.filter((_, i) => i >= currentIdx);

  async function handleSubmit() {
    if (!senderName.trim()) {
      setError("Please enter the name used for the bank transfer.");
      return;
    }
    if (!receipt) {
      setError("Please upload your payment receipt.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("planId", selected);
      formData.append("senderName", senderName.trim());
      formData.append("receipt", receipt);

      const res = await fetch(`/api/pay/${link.slug}/transfer`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      window.location.reload();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <span className="font-semibold tracking-tight text-neutral-900">YusTech</span>
            <span className="text-neutral-400 text-sm ml-2">/ Subscription Renewal</span>
          </div>
          <span className="text-xs text-neutral-400">Secure payment via bank transfer</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Client info banner */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-8 flex flex-wrap gap-6 items-center">
          <div>
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Client</div>
            <div className="font-semibold text-neutral-900">{link.client_name}</div>
          </div>
          {link.current_plan_label && (
            <div>
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Current Plan</div>
              <span className="inline-flex items-center gap-1 text-sm font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
                {link.current_plan_label}
              </span>
            </div>
          )}
          <div>
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Available Credit</div>
            <div className="font-semibold text-green-700">{formatNGN(link.available_credit)}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Loyalty Discount</div>
            <div className="font-semibold text-purple-700">{link.loyalty_discount_percent}% applied</div>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Choose your renewal plan</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Prices already reflect your {link.loyalty_discount_percent}% loyalty discount and {formatNGN(link.available_credit)} credit.
        </p>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {plans.map((plan: PaymentLinkPlan) => {
            const isSelected = selected === plan.id;
            return (
              <div
                key={plan.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(plan.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelected(plan.id)}
                className={`cursor-pointer rounded-xl border-2 p-5 transition-all select-none ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 shadow-sm"
                    : "border-neutral-200 bg-white hover:border-neutral-400"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-neutral-900 text-sm">{plan.name}</div>
                    {plan.is_current && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 mt-0.5">
                        <StarIcon className="w-3 h-3" /> Current plan
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 transition-colors ${
                      isSelected ? "border-blue-600 bg-blue-600" : "border-neutral-300"
                    }`}
                  />
                </div>

                <div className="mb-4">
                  <div className="text-xs text-neutral-400 line-through">{formatNGN(plan.original_price)}</div>
                  <div className="text-xs text-neutral-500">
                    After discount: {formatNGN(plan.after_discount)}
                  </div>
                  <div className={`text-xl font-bold mt-1 ${isSelected ? "text-blue-700" : "text-neutral-900"}`}>
                    {formatNGN(plan.after_credit)}
                  </div>
                  <div className="text-xs text-neutral-400">/ year</div>
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-1.5 text-xs text-neutral-600">
                      <CheckIcon className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Downgrade warning */}
        {isDowngrade && currentPlan && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  This plan may not support your current website activity
                </p>
                <p className="text-sm text-amber-800 mb-3">
                  <strong>{selectedPlan.name}</strong> offers fewer features than your current{" "}
                  <strong>{currentPlan.name}</strong> plan. Downgrading may affect your site&apos;s
                  performance, backup frequency, support response times, and other active services.
                </p>
                <p className="text-sm text-amber-800 mb-3">We recommend staying on one of these plans:</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedPlans.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelected(p.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                        p.is_current
                          ? "bg-amber-100 border-amber-400 text-amber-900 hover:bg-amber-200"
                          : "bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
                      }`}
                    >
                      {p.id !== selectedPlan.id && <ArrowUpIcon className="w-3 h-3" />}
                      {p.name}
                      {p.is_current && " (current)"}
                      {" — "}{formatNGN(p.after_credit)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bank transfer + receipt upload */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-6">
          {/* Bank details */}
          <div className="p-6 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">Transfer to this account</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="text-xs text-neutral-500 mb-1">Bank</div>
                <div className="font-semibold text-neutral-900">{BANK_DETAILS.bankName}</div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="text-xs text-neutral-500 mb-1">Account Number</div>
                <div className="font-semibold text-neutral-900 text-lg tracking-widest">{BANK_DETAILS.accountNumber}</div>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="text-xs text-neutral-500 mb-1">Account Name</div>
                <div className="font-semibold text-neutral-900">{BANK_DETAILS.accountName}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <span className="text-xs text-blue-700">Transfer exactly</span>
              <span className="font-bold text-blue-800">{formatNGN(selectedPlan.after_credit)}</span>
              <span className="text-xs text-blue-700">for the <strong>{selectedPlan.name}</strong> plan</span>
            </div>
          </div>

          {/* Receipt upload form */}
          <div className="p-6">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">Upload your receipt</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                  Name used for the transfer
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Beauty Finds NG"
                  className="w-full sm:w-80 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                  Payment receipt (screenshot or PDF)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border-2 border-dashed border-neutral-300 rounded-lg px-6 py-8 text-center hover:border-blue-400 transition-colors"
                >
                  <UploadIcon className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                  {receipt ? (
                    <p className="text-sm font-medium text-blue-700">{receipt.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-600">Click to upload receipt</p>
                      <p className="text-xs text-neutral-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loading ? "Submitting…" : `Submit Receipt — ${formatNGN(selectedPlan.after_credit)}`}
              </button>
              <p className="text-xs text-neutral-400">We&apos;ll confirm your payment within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
