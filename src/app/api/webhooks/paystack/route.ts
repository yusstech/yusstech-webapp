import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { addMonths } from "@/lib/utils";

// Disable body parsing — we need the raw body for HMAC verification
export const dynamic = "force-dynamic";

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const hash = createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createServiceClient();

  switch (event.event) {
    case "charge.success": {
      // Recurring charge succeeded — update renewal date and status
      const customerCode = event.data.customer?.customer_code;
      if (!customerCode) break;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id, user_id, next_renewal_date")
        .eq("paystack_customer_code", customerCode)
        .single();

      if (!sub) break;

      const newRenewal = addMonths(new Date(sub.next_renewal_date), 1)
        .toISOString()
        .split("T")[0];

      await supabase
        .from("subscriptions")
        .update({ status: "active", next_renewal_date: newRenewal })
        .eq("id", sub.id);

      await supabase.from("invoices").insert({
        user_id: sub.user_id,
        subscription_id: sub.id,
        amount: event.data.amount,
        currency: event.data.currency,
        status: "paid",
        paystack_reference: event.data.reference,
      });

      break;
    }

    case "subscription.disable": {
      // Subscription cancelled or payment failed repeatedly
      const customerCode = event.data.customer?.customer_code;
      if (!customerCode) break;

      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("paystack_customer_code", customerCode);

      break;
    }

    case "invoice.payment_failed": {
      const customerCode = event.data.customer?.customer_code;
      if (!customerCode) break;

      await supabase
        .from("subscriptions")
        .update({ status: "overdue" })
        .eq("paystack_customer_code", customerCode);

      break;
    }

    default:
      // Unhandled event — acknowledge receipt
      break;
  }

  return NextResponse.json({ received: true });
}
