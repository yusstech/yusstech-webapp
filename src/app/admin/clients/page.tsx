import { createServiceClient } from "@/lib/supabase/server";
import { PLANS, formatPrice } from "@/lib/plans";
import { formatDate, daysUntil } from "@/lib/utils";
import type { SubscriptionRow, UserRow, Plan } from "@/types/database";
import OutgrownToggle from "./OutgrownToggle";
import { AlertTriangleIcon } from "lucide-react";

export default async function AdminClientsPage() {
  const supabase = createServiceClient();

  // Fetch users and subscriptions separately to keep type safety
  const [{ data: users }, { data: subscriptions }] = await Promise.all([
    supabase
      .from("users")
      .select("*")
      .eq("role", "client")
      .order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*"),
  ]);

  const clients = users?.map((u) => ({
    ...u,
    subscription: subscriptions?.find((s) => s.user_id === u.id) ?? null,
  }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-8">Clients</h1>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {!clients || clients.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-neutral-500">
            No clients yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                {[
                  "Client",
                  "Plan",
                  "Status",
                  "Next renewal",
                  "Outgrown",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {clients.map((client) => {
                const sub = client.subscription;
                const plan = sub ? PLANS[sub.plan as Plan] : null;
                const renewalDays = sub ? daysUntil(sub.next_renewal_date) : null;

                return (
                  <tr key={client.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-neutral-500">
                        {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {plan ? (
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          {plan.monthlyPrice > 0 && (
                            <div className="text-xs text-neutral-500">
                              {formatPrice(plan.monthlyPrice)}/mo
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400">No plan</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            sub.status === "active"
                              ? "bg-green-50 text-green-700"
                              : sub.status === "overdue"
                              ? "bg-red-50 text-red-700"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {sub.status}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <div>
                          <div>{formatDate(sub.next_renewal_date)}</div>
                          {renewalDays !== null && renewalDays <= 7 && (
                            <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                              <AlertTriangleIcon className="w-3 h-3" />
                              {renewalDays}d
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <OutgrownToggle
                          subscriptionId={sub.id}
                          outgrown={sub.outgrown}
                        />
                      ) : (
                        <span className="text-neutral-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
