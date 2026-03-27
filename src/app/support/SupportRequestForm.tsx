"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RequestCategory } from "@/types/database";
import { CheckCircle2Icon } from "lucide-react";

const CATEGORIES: { value: RequestCategory; label: string; description: string }[] = [
  { value: "bug", label: "Bug", description: "Something is broken" },
  { value: "content", label: "Content update", description: "Text, images, or page changes" },
  { value: "feature", label: "New feature", description: "Adding something new" },
  { value: "emergency", label: "Emergency", description: "Site is down or critical issue" },
];

export default function SupportRequestForm({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "" as RequestCategory | "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const mayRequireQuote = form.category === "feature";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.body || !form.category) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/support/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-start gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2Icon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900">Request submitted</p>
            <p className="text-sm text-neutral-500">
              We&apos;ll respond within your plan&apos;s response time.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ title: "", body: "", category: "" });
          }}
          className="text-sm text-neutral-600 underline hover:text-neutral-900 transition-colors"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.value}
              onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
              className={`text-left p-3 rounded-lg border text-sm transition-all ${
                form.category === cat.value
                  ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <div className="font-medium">{cat.label}</div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {cat.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Out of scope notice — feature only */}
      {mayRequireQuote && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          New features may require a custom quote. Our team will review and respond within your plan&apos;s response time.
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Subject</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Brief description of the issue"
          maxLength={120}
          className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Details</label>
        <textarea
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          placeholder="Describe what you need or what's happening"
          rows={4}
          className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!form.title || !form.body || !form.category || loading}
        className="bg-neutral-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
