import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import type { Plan } from "@/types/database";
import { addMonths, firstOfNextMonth } from "@/lib/utils";

export async function POST(req: Request) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const body = await req.json();
  const { plan, businessName, siteUrl, email } = body as {
    plan: Plan;
    businessName: string;
    siteUrl: string;
    email: string;
  };

  if (!plan || !businessName || !siteUrl || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const planConfig = PLANS[plan];
  if (!planConfig) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Upsert the user record (first time after Clerk sign-up)
  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert(
      {
        clerk_id: userId,
        email,
        name: businessName,
        role: "client",
      },
      { onConflict: "clerk_id" }
    )
    .select()
    .single();

  if (userError || !user) {
    console.error("User upsert error:", userError);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  // Check they don't already have an active subscription
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingSub) {
    return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
  }

  // Initialise Paystack transaction
  const amount = planConfig.monthlyPrice; // kobo
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/verify?userId=${user.id}&plan=${plan}&siteUrl=${encodeURIComponent(siteUrl)}`;

  const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      callback_url: callbackUrl,
      metadata: {
        userId: user.id,
        plan,
        businessName,
        siteUrl,
      },
      channels: ["card", "bank_transfer"],
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
