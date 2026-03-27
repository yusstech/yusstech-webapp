import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { PaymentLinkPlan } from "@/types/database";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await req.json();
  const { planId } = body as { planId: string };

  if (!planId) {
    return NextResponse.json({ error: "Missing planId" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: link, error } = await supabase
    .from("payment_links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !link) {
    return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
  }

  if (link.status !== "active") {
    return NextResponse.json(
      { error: link.status === "paid" ? "This link has already been paid." : "This link has expired." },
      { status: 409 }
    );
  }

  const plan = (link.plans as PaymentLinkPlan[]).find((p) => p.id === planId);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan selection" }, { status: 400 });
  }

  const amountKobo = plan.after_credit * 100;
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/pay/${slug}/verify?planId=${planId}`;

  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: link.client_email,
      amount: amountKobo,
      callback_url: callbackUrl,
      metadata: {
        slug,
        planId,
        planName: plan.name,
        clientName: link.client_name,
      },

    }),
  });

  const paystackData = await paystackRes.json();

  if (!paystackData.status) {
    console.error("Paystack init error:", paystackData);
    return NextResponse.json(
      { error: paystackData.message || "Payment initialisation failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    authorizationUrl: paystackData.data.authorization_url,
    reference: paystackData.data.reference,
  });
}
