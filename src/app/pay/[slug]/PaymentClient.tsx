"use client";

import { useState, useRef } from "react";
import {
  CheckIcon,
  StarIcon,
  AlertTriangleIcon,
  UploadIcon,
  CreditCardIcon,
  XIcon,
  BuildingIcon,
  RefreshCwIcon,
} from "lucide-react";
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

const EXPIRY_DATE = new Date("2026-04-01");

type ModalState = "method" | "pay";

export default function PaymentClient({ link }: { link: PaymentLinkRow }) {
  const plans = link.plans as PaymentLinkPlan[];
  const currentPlan = plans.find((p) => p.is_current);

  const currentIdx = currentPlan ? plans.findIndex((p) => p.is_current) : 0;
  const visiblePlans = plans.filter((_, i) => i >= currentIdx);

  const [selectedId, setSelectedId] = useState<string>(
    currentPlan?.id ?? plans[0].id
  );
  const [modal, setModal] = useState<ModalState | null>(null);
  const [senderName, setSenderName] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPlan = plans.find((p) => p.id === selectedId) ?? currentPlan!;

  const daysLeft = Math.ceil((EXPIRY_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const urgent = daysLeft <= 7;

  function openModal(planId: string) {
    setSelectedId(planId);
    setModal("method");
    setError(null);
    setSenderName("");
    setReceipt(null);
  }

  function closeModal() {
    setModal(null);
    setError(null);
    setSenderName("");
    setReceipt(null);
  }

  async function handleSubmit() {
    if (!senderName.trim()) {
      setError("Please enter the name used for the transfer.");
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
      formData.append("planId", selectedId!);
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
      window.location.href = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
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
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Client info */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 flex flex-wrap gap-6 items-center">
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

        {/* Expiry banner */}
        <div className={`rounded-xl border p-4 mb-8 ${urgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className={`w-5 h-5 shrink-0 mt-0.5 ${urgent ? "text-red-500" : "text-amber-500"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold mb-2 ${urgent ? "text-red-900" : "text-amber-900"}`}>
                Subscription expires <strong>April 1, 2026</strong> — {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
              </p>
              <div className="w-full bg-white/60 rounded-full h-1.5 mb-3 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${urgent ? "bg-red-400" : "bg-amber-400"}`}
                  style={{ width: `${Math.max(4, Math.min(100, (daysLeft / 30) * 100))}%` }}
                />
              </div>
              <p className={`text-sm ${urgent ? "text-red-700" : "text-amber-800"}`}>
                Renew before April 1 to keep your website running without interruption. Once payment is confirmed,
                your subscription <strong>automatically renews for another year</strong>.
                If not received by then, <strong>your website will be taken offline</strong>.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Your renewal plan</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Price reflects your {link.loyalty_discount_percent}% loyalty discount and {formatNGN(link.available_credit)} credit.
          Click to proceed with payment.
        </p>

        {/* Plan cards — current plan + upgrades only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {visiblePlans.map((plan: PaymentLinkPlan) => (
            <div
              key={plan.id}
              role="button"
              tabIndex={0}
              onClick={() => openModal(plan.id)}
              onKeyDown={(e) => e.key === "Enter" && openModal(plan.id)}
              className="cursor-pointer rounded-xl border-2 border-neutral-200 bg-white p-5 hover:border-blue-500 hover:shadow-md transition-all select-none group"
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
                <div className="w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors shrink-0">
                  <CheckIcon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-neutral-400 line-through">{formatNGN(plan.original_price)}</div>
                <div className="text-xs text-neutral-500">After discount: {formatNGN(plan.after_discount)}</div>
                <div className="text-xl font-bold mt-1 text-neutral-900 group-hover:text-blue-700 transition-colors">
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
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && selectedPlan && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-neutral-100 z-10">
              <div>
                <div className="font-semibold text-neutral-900">{selectedPlan.name}</div>
                <div className="text-sm text-neutral-500">{formatNGN(selectedPlan.after_credit)} / year</div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors shrink-0"
              >
                <XIcon className="w-4 h-4 text-neutral-600" />
              </button>
            </div>

            {/* STATE 1: Method */}
            {modal === "method" && (
              <div className="p-6">
                <p className="text-sm font-medium text-neutral-700 mb-4">Choose payment method</p>
                <div className="space-y-3">
                  {/* Card — unavailable */}
                  <div className="border-2 border-neutral-200 rounded-xl p-4 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                        <CreditCardIcon className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-700">Pay with Card</span>
                          <span className="text-xs font-medium bg-neutral-200 text-neutral-500 px-2 py-0.5 rounded-full">Unavailable</span>
                        </div>
                        <div className="text-xs text-neutral-400">Visa · Mastercard · Verve</div>
                      </div>
                    </div>
                  </div>

                  {/* Bank transfer */}
                  <button
                    type="button"
                    onClick={() => { setModal("pay"); setError(null); }}
                    className="w-full flex items-center gap-4 border-2 border-blue-600 bg-blue-50 rounded-xl p-4 text-left hover:bg-blue-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <BuildingIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-blue-800">Pay by Bank Transfer</div>
                      <div className="text-xs text-blue-600">Taj Bank · Upload receipt after transfer</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* STATE 2: Pay — bank details + upload combined */}
            {modal === "pay" && (
              <div className="p-6 space-y-5">
                {/* Bank details */}
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Transfer to</p>
                  <div className="space-y-2">
                    {[
                      { label: "Bank", value: BANK_DETAILS.bankName },
                      { label: "Account Number", value: BANK_DETAILS.accountNumber },
                      { label: "Account Name", value: BANK_DETAILS.accountName },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3">
                        <span className="text-xs text-neutral-500">{label}</span>
                        <span className="text-sm font-semibold text-neutral-900 tracking-wide">{value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                      <span className="text-xs text-blue-700 font-medium">Amount</span>
                      <span className="text-base font-bold text-blue-800">{formatNGN(selectedPlan.after_credit)}</span>
                    </div>
                  </div>
                </div>

                {/* Auto-renewal note */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <RefreshCwIcon className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-700"><strong>Auto-renews for 1 year</strong> once payment is confirmed.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangleIcon className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-neutral-700">Website goes offline if not paid by <strong>April 1, 2026</strong>.</p>
                  </div>
                </div>

                {/* Receipt form */}
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Upload your receipt</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                        Name used for the transfer
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. Beauty Finds NG"
                        className="w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1.5">
                        Receipt (screenshot or PDF)
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer border-2 border-dashed border-neutral-300 rounded-xl px-6 py-6 text-center hover:border-blue-400 transition-colors"
                      >
                        <UploadIcon className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                        {receipt ? (
                          <p className="text-sm font-medium text-blue-700">{receipt.name}</p>
                        ) : (
                          <>
                            <p className="text-sm text-neutral-600">Click to upload</p>
                            <p className="text-xs text-neutral-400 mt-0.5">PNG, JPG or PDF · max 10MB</p>
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
                  </div>
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setModal("method"); setError(null); }}
                    className="flex-1 border border-neutral-300 text-neutral-700 font-medium px-4 py-3 rounded-xl hover:bg-neutral-50 transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {loading ? "Submitting…" : "Submit Receipt"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
