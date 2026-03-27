"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OutgrownToggle({
  subscriptionId,
  outgrown,
}: {
  subscriptionId: string;
  outgrown: boolean;
}) {
  const [active, setActive] = useState(outgrown);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    const next = !active;

    try {
      const res = await fetch("/api/admin/outgrown", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, outgrown: next }),
      });
      if (res.ok) {
        setActive(next);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? "Remove outgrown flag" : "Flag as outgrown"}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        active ? "bg-amber-500" : "bg-neutral-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
