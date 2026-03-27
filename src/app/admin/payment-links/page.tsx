import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

function formatNGN(amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

const statusStyles: Record<string, string> = {
  active: "bg-blue-50 text-blue-700",
  paid: "bg-green-50 text-green-700",
  expired: "bg-neutral-100 text-neutral-500",
};

export default async function PaymentLinksPage() {
  const supabase = createServiceClient();
  const { data: links } = await supabase
    .from("payment_links")
    .select("*")
    .order("created_at", { ascending: false });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Payment Links</h1>
        <Link
          href="/admin/payment-links/new"
          className="inline-flex items-center gap-2 bg-neutral-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New link
        </Link>
      </div>

      {!links || links.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-10 text-center text-sm text-neutral-500">
          No payment links yet.{" "}
          <Link href="/admin/payment-links/new" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Slug / URL</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Paid plan</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-neutral-900">{link.client_name}</div>
                    <div className="text-xs text-neutral-400">{link.client_email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <a
                      href={`${appUrl}/pay/${link.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-mono text-xs"
                    >
                      /pay/{link.slug}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${
                        statusStyles[link.status] ?? ""
                      }`}
                    >
                      {link.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-600">{link.paid_plan_label ?? "—"}</td>
                  <td className="px-5 py-3.5 text-neutral-600">{formatNGN(link.paid_amount)}</td>
                  <td className="px-5 py-3.5 text-neutral-400">{formatDate(link.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
