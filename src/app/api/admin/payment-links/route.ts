import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const SLUG_PATTERN = /^[a-z0-9-]{2,60}$/;

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    slug,
    clientName,
    clientEmail,
    currentPlanLabel,
    availableCredit,
    loyaltyDiscountPercent,
    plans,
  } = body;

  if (!slug || !clientName || !clientEmail || !plans) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: "Slug must be 2–60 lowercase letters, numbers, or hyphens only" },
      { status: 400 }
    );
  }

  if (typeof clientEmail !== "string" || !clientEmail.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!Array.isArray(plans) || plans.length === 0) {
    return NextResponse.json({ error: "Plans must be a non-empty array" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("payment_links")
    .insert({
      slug,
      client_name: clientName,
      client_email: clientEmail,
      current_plan_label: currentPlanLabel ?? null,
      available_credit: availableCredit ?? 0,
      loyalty_discount_percent: loyaltyDiscountPercent ?? 0,
      plans,
    })
    .select()
    .single();

  if (error) {
    console.error("Create payment link error:", error);
    return NextResponse.json(
      { error: error.code === "23505" ? "A link with this slug already exists." : "Failed to create link" },
      { status: error.code === "23505" ? 409 : 500 }
    );
  }

  return NextResponse.json({ id: data.id, slug: data.slug });
}
