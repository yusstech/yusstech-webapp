"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_PLANS = JSON.stringify(
  [
    {
      id: "basic_care",
      name: "Basic Care",
      is_current: false,
      original_price: 500000,
      after_discount: 450000,
      after_credit: 275000,
      features: ["Standard Hosting Server", "1-Year Domain Renewal", "Basic Security Protection", "Monthly Plugin Updates", "Monthly Backups", "Limited Product Uploads", "Basic Technical Support (48hrs response)"],
    },
    {
      id: "business_pro",
      name: "Business Pro",
      is_current: false,
      original_price: 700000,
      after_discount: 630000,
      after_credit: 465000,
      features: ["High-Performance Hosting", "1-Year Domain Renewal + Privacy Protection", "Advanced Security Protection", "Monthly Plugin Monitoring", "Weekly Backups", "Unlimited Product Uploads", "Priority Support"],
    },
    {
      id: "business_premium",
      name: "Business Premium",
      is_current: true,
      original_price: 900000,
      after_discount: 810000,
      after_credit: 665000,
      features: ["2X Faster High-Performance Server", "Full Domain Protection Suite", "Daily Plugin Monitoring", "Daily Offsite Backups", "Real-Time Threat Monitoring", "Unlimited Product Uploads & Edits", "Up to 3 Campaign Landing Pages Per Year", "Speed Optimization & Database Cleanup", "Dedicated 1-on-1 Technical Support", "Same-Day Emergency Response", "Monthly Website Performance Report"],
    },
    {
      id: "premium_pro",
      name: "Premium Pro",
      is_current: false,
      original_price: 1500000,
      after_discount: 1350000,
      after_credit: 1225000,
      features: ["Everything in Business Premium", "Paid Premium Pro Plugin Licenses", "Advanced Conversion Optimization Tools", "Premium SEO Suite Integration", "Advanced Analytics & Heatmap Tracking", "Email Marketing System Integration", "Quarterly Strategy Review Meetings", "Dedicated Growth Consultant"],
    },
  ],
  null,
  2
);

export default function NewLinkForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [currentPlanLabel, setCurrentPlanLabel] = useState("");
  const [availableCredit, setAvailableCredit] = useState("0");
  const [loyaltyDiscount, setLoyaltyDiscount] = useState("0");
  const [plansJson, setPlansJson] = useState(DEFAULT_PLANS);
  const [jsonError, setJsonError] = useState<string | null>(null);

  function validateJson(value: string) {
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch {
      setJsonError("Invalid JSON");
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateJson(plansJson)) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/payment-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          clientName,
          clientEmail,
          currentPlanLabel: currentPlanLabel || null,
          availableCredit: parseInt(availableCredit, 10) || 0,
          loyaltyDiscountPercent: parseInt(loyaltyDiscount, 10) || 0,
          plans: JSON.parse(plansJson),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create link");
        return;
      }

      router.push("/admin/payment-links");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Slug</label>
          <input
            type="text"
            required
            placeholder="e.g. beautyfindsng"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-neutral-400 mt-1">URL will be /pay/{slug || "…"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Current Plan Label</label>
          <input
            type="text"
            placeholder="e.g. Business Premium"
            value={currentPlanLabel}
            onChange={(e) => setCurrentPlanLabel(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Client Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Beautyfindsng"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Client Email</label>
          <input
            type="email"
            required
            placeholder="client@example.com"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Available Credit (NGN)</label>
          <input
            type="number"
            min="0"
            value={availableCredit}
            onChange={(e) => setAvailableCredit(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Loyalty Discount (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={loyaltyDiscount}
            onChange={(e) => setLoyaltyDiscount(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Plans (JSON)</label>
        <textarea
          required
          rows={14}
          value={plansJson}
          onChange={(e) => {
            setPlansJson(e.target.value);
            validateJson(e.target.value);
          }}
          className={`w-full font-mono text-xs border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            jsonError ? "border-red-400" : "border-neutral-300"
          }`}
        />
        {jsonError && <p className="text-xs text-red-600 mt-1">{jsonError}</p>}
        <p className="text-xs text-neutral-400 mt-1">
          Array of plan objects. Each: id, name, is_current, original_price, after_discount, after_credit, features[].
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !!jsonError}
          className="bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating…" : "Create payment link"}
        </button>
        <a
          href="/admin/payment-links"
          className="text-sm text-neutral-600 hover:text-neutral-900 px-4 py-2.5"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
