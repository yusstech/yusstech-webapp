import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { RequestStatus } from "@/types/database";

export async function PATCH(req: Request) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { requestId, status } = await req.json();
  const validStatuses: RequestStatus[] = ["open", "in_progress", "resolved"];

  if (!requestId || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("support_requests")
    .update({
      status,
      ...(status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
    })
    .eq("id", requestId);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
