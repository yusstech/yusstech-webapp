import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getPlanAllowance } from "@/lib/plans";
import type { RequestCategory } from "@/types/database";

const OUT_OF_SCOPE_CATEGORIES: RequestCategory[] = ["feature", "emergency"];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const { title, body: reqBody, category } = body as {
    title: string;
    body: string;
    category: RequestCategory;
  };

  if (!title || !reqBody || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!user || !subscription) {
    return NextResponse.json({ error: "No active subscription" }, { status: 403 });
  }

  // Enforce monthly limit
  const allowance = getPlanAllowance(subscription.plan);
  if (
    allowance < 999 &&
    subscription.requests_used_this_month >= allowance
  ) {
    return NextResponse.json(
      { error: "Monthly request limit reached" },
      { status: 429 }
    );
  }

  const out_of_scope = OUT_OF_SCOPE_CATEGORIES.includes(category);

  // Insert request
  const { error: insertError } = await supabase
    .from("support_requests")
    .insert({
      user_id: user.id,
      title,
      body: reqBody,
      category,
      out_of_scope,
    });

  if (insertError) {
    console.error("Support request insert error:", insertError);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }

  // Increment usage counter
  await supabase
    .from("subscriptions")
    .update({ requests_used_this_month: subscription.requests_used_this_month + 1 })
    .eq("id", subscription.id);

  return NextResponse.json({ success: true });
}
