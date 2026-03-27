import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="bg-white border border-neutral-200 rounded-xl p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Payment successful!</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Thank you — your subscription has been renewed. You&apos;ll receive a confirmation email shortly from YusTech.
        </p>
        <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-4 text-xs text-neutral-500">
          Questions? Email us at{" "}
          <a href="mailto:support@yusstech.com" className="text-blue-600 hover:underline">
            support@yusstech.com
          </a>
        </div>
      </div>
    </div>
  );
}
