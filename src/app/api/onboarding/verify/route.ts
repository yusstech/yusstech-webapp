import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { Plan } from "@/types/database";
import { addMonths, firstOfNextMonth } from "@/lib/utils";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference");
  const userId = url.searchParams.get("userId");
  const plan = url.searchParams.get("plan") as Plan;
  const siteUrl = url.searchParams.get("siteUrl") || "";

  if (!reference || !userId || !plan) {
    return NextResponse.redirect(
      new URL("/onboarding?error=missing_params", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  // Verify payment with Paystack
  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const verifyData = await verifyRes.json();

  if (!verifyData.status || verifyData.data.status !== "success") {
    return NextResponse.redirect(
      new URL("/onboarding?error=payment_failed", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const supabase = createServiceClient();
  const renewalDate = addMonths(new Date(), 1).toISOString().split("T")[0];
  const resetDate = firstOfNextMonth().toISOString().split("T")[0];

  // Create subscription
  const { error: subError } = await supabase.from("subscriptions").insert({
    user_id: userId,
    plan,
    track: "wordpress",
    status: "active",
    billing_cycle: "monthly",
    next_renewal_date: renewalDate,
    paystack_customer_code: verifyData.data.customer?.customer_code || null,
    site_url: siteUrl || null,
    requests_used_this_month: 0,
    usage_reset_date: resetDate,
  });

  if (subError) {
    console.error("Subscription insert error:", subError);
    return NextResponse.redirect(
      new URL("/dashboard?error=subscription_failed", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  // Record invoice
  await supabase.from("invoices").insert({
    user_id: userId,
    subscription_id: (
      await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .single()
    ).data!.id,
    amount: verifyData.data.amount,
    currency: verifyData.data.currency,
    status: "paid",
    paystack_reference: reference,
  });

  return NextResponse.redirect(
    new URL("/dashboard?welcome=1", process.env.NEXT_PUBLIC_APP_URL!)
  );
}
