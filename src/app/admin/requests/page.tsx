import { createServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import RequestStatusSelect from "./RequestStatusSelect";
import type { RequestStatus } from "@/types/database";

export default async function AdminRequestsPage() {
  const supabase = createServiceClient();

  const { data: requests } = await supabase
    .from("support_requests")
    .select("*, users(name, email)")
    .order("created_at", { ascending: false });

  const open = requests?.filter((r) => r.status === "open") ?? [];
  const inProgress = requests?.filter((r) => r.status === "in_progress") ?? [];
  const resolved = requests?.filter((r) => r.status === "resolved") ?? [];

  const columns: { label: string; status: RequestStatus; items: typeof open }[] = [
    { label: "Open", status: "open", items: open },
    { label: "In Progress", status: "in_progress", items: inProgress },
    { label: "Resolved", status: "resolved", items: resolved },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-8">Support Requests</h1>

      <div className="grid grid-cols-3 gap-4">
        {columns.map(({ label, status, items }) => (
          <div key={status}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-medium text-sm">{label}</h2>
              <span className="text-xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-full font-medium">
                {items.length}
              </span>
            </div>
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="bg-white border border-dashed border-neutral-200 rounded-xl p-4 text-xs text-center text-neutral-400">
                  None
                </div>
              ) : (
                items.map((req) => {
                  const user = req.users as unknown as {
                    name: string;
                    email: string;
                  } | null;
                  return (
                    <div
                      key={req.id}
                      className="bg-white border border-neutral-200 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm leading-snug">
                            {req.title}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">
                            {user?.name} · {req.category}
                          </div>
                        </div>
                        {req.out_of_scope && (
                          <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                            Quote
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-3 mb-3">
                        {req.body}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">
                          {formatDate(req.created_at)}
                        </span>
                        <RequestStatusSelect
                          requestId={req.id}
                          currentStatus={req.status as RequestStatus}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
