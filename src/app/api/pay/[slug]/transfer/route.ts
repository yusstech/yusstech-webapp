import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import type { PaymentLinkPlan } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const formData = await req.formData();
  const planId = formData.get("planId") as string | null;
  const receipt = formData.get("receipt") as File | null;
  const senderName = formData.get("senderName") as string | null;

  if (!planId || !receipt || !senderName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
    const isPending = (link.status as string) === "pending_verification";
    return NextResponse.json(
      { error: isPending ? "Receipt already submitted." : "This link is no longer active." },
      { status: 409 }
    );
  }

  const plan = (link.plans as PaymentLinkPlan[]).find((p) => p.id === planId);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan selection" }, { status: 400 });
  }

  // Convert receipt file to buffer for email attachment
  const buffer = Buffer.from(await receipt.arrayBuffer());

  const adminEmail = process.env.ADMIN_EMAIL!;
  const fromEmail = process.env.RESEND_FROM_EMAIL!;

  const emailResult = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `Payment Receipt — ${link.client_name} (${plan.name})`,
    html: `
      <h2>New Bank Transfer Receipt</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:480px">
        <tr><td style="color:#666">Client</td><td><strong>${link.client_name}</strong></td></tr>
        <tr><td style="color:#666">Email</td><td>${link.client_email}</td></tr>
        <tr><td style="color:#666">Sender Name</td><td>${senderName}</td></tr>
        <tr><td style="color:#666">Plan</td><td>${plan.name}</td></tr>
        <tr><td style="color:#666">Amount</td><td><strong>NGN ${plan.after_credit.toLocaleString()}</strong></td></tr>
      </table>
      <p style="margin-top:16px;color:#444">Receipt is attached. Please verify and mark as paid in the admin panel.</p>
    `,
    attachments: [
      {
        filename: receipt.name || "receipt",
        content: buffer,
      },
    ],
  });

  if (emailResult.error) {
    console.error("Resend error:", emailResult.error);
    return NextResponse.json({ error: "Failed to send notification email. Please try again." }, { status: 500 });
  }

  await supabase
    .from("payment_links")
    .update({ status: "pending_verification" })
    .eq("slug", slug)
    .eq("status", "active");

  return NextResponse.json({ success: true });
}
