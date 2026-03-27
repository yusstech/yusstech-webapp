import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import NewLinkForm from "./NewLinkForm";

export default function NewPaymentLinkPage() {
  return (
    <div className="p-8">
      <Link
        href="/admin/payment-links"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Payment Links
      </Link>
      <h1 className="text-2xl font-semibold mb-8">New Payment Link</h1>
      <NewLinkForm />
    </div>
  );
}
