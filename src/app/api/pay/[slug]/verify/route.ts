import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PaymentLinkPlan } from "@/types/database";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const reference = url.searchParams.get("reference");
  const planId = url.searchParams.get("planId");

  if (!reference || !planId) {
    return NextResponse.redirect(
      new URL(`/pay/${slug}?error=missing_params`, baseUrl)
    );
  }

  // Verify with Paystack
  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData.status || verifyData.data.status !== "success") {
    return NextResponse.redirect(
      new URL(`/pay/${slug}?error=payment_failed`, baseUrl)
    );
  }

  const supabase = createServiceClient();

  const { data: link } = await supabase
    .from("payment_links")
    .select("status, plans, paystack_reference")
    .eq("slug", slug)
    .single();

  // Idempotency: already processed — just redirect to success
  if (link?.status === "paid") {
    return NextResponse.redirect(
      new URL(`/pay/${slug}`, baseUrl)
    );
  }

  // Prevent replay with a different reference on an already-seen link
  if (link?.paystack_reference && link.paystack_reference !== reference) {
    return NextResponse.redirect(
      new URL(`/pay/${slug}?error=payment_failed`, baseUrl)
    );
  }

  const plan = (link?.plans as PaymentLinkPlan[] | undefined)?.find(
    (p) => p.id === planId
  );

  await supabase
    .from("payment_links")
    .update({
      status: "paid",
      paid_plan_label: plan?.name ?? planId,
      paid_amount: verifyData.data.amount / 100, // kobo → NGN
      paystack_reference: reference,
    })
    .eq("slug", slug)
    .eq("status", "active"); // Only update if still active (extra idempotency guard)

  return NextResponse.redirect(
    new URL(`/pay/${slug}`, baseUrl)
  );
}
