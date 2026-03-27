import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import PaymentClient from "./PaymentClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PayPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: link, error } = await supabase
    .from("payment_links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !link) notFound();

  if (link.status === "paid") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-10 max-w-md text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Payment received</h1>
          <p className="text-sm text-neutral-500">
            Your <strong>{link.paid_plan_label}</strong> subscription has been renewed. Thank you!
          </p>
        </div>
      </div>
    );
  }

  if (link.status === "expired") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-10 max-w-md text-center">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">This link has expired</h1>
          <p className="text-sm text-neutral-500">Please contact YusTech to get a new payment link.</p>
        </div>
      </div>
    );
  }

  return <PaymentClient link={link} />;
}
