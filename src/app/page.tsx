import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PLANS, PLAN_ORDER, formatPrice } from "@/lib/plans";
import { CheckIcon } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Nav */}
      <nav className="border-b border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">YusTech</span>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          Your site, managed.
          <br />
          <span className="text-neutral-500">No more WhatsApp updates.</span>
        </h1>
        <p className="mt-6 text-lg text-neutral-600 max-w-xl mx-auto">
          See your plan, track requests, and handle renewals — all in one place.
          YusTech handles the rest.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            Get started
          </Link>
          <Link
            href="#plans"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            See plans →
          </Link>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold text-center mb-12">
          WordPress Managed Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isPopular = planId === "business";
            return (
              <div
                key={planId}
                className={`rounded-xl border p-6 bg-white flex flex-col gap-4 ${
                  isPopular
                    ? "border-neutral-900 ring-1 ring-neutral-900"
                    : "border-neutral-200"
                }`}
              >
                {isPopular && (
                  <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Most popular
                  </span>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {plan.tagline}
                  </p>
                </div>
                <div className="text-2xl font-bold">
                  {plan.monthlyPrice > 0 ? (
                    <>
                      {formatPrice(plan.monthlyPrice)}
                      <span className="text-sm font-normal text-neutral-500">
                        /mo
                      </span>
                    </>
                  ) : (
                    <span className="text-neutral-400 text-base font-normal">
                      Pricing coming soon
                    </span>
                  )}
                </div>
                <ul className="space-y-2 text-sm text-neutral-600 flex-1">
                  <li className="flex gap-2">
                    <CheckIcon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    {plan.backups} backups
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    {plan.pluginUpdates} plugin updates
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    {plan.supportResponse} support response
                  </li>
                  <li className="flex gap-2">
                    <CheckIcon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    {plan.changeRequestsPerMonth === "unlimited"
                      ? "Unlimited"
                      : plan.changeRequestsPerMonth}{" "}
                    change request
                    {plan.changeRequestsPerMonth !== 1 &&
                    plan.changeRequestsPerMonth !== "unlimited"
                      ? "s"
                      : ""}
                    /mo
                  </li>
                  {plan.directMessaging && (
                    <li className="flex gap-2">
                      <CheckIcon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                      Direct messaging
                    </li>
                  )}
                  {(plan.devHoursIncluded as number) > 0 && (
                    <li className="flex gap-2">
                      <CheckIcon className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                      {plan.devHoursIncluded} dev hour
                      {plan.devHoursIncluded !== 1 ? "s" : ""} included
                    </li>
                  )}
                </ul>
                <Link
                  href={`/sign-up?plan=${planId}`}
                  className={`mt-2 w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                    isPopular
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  Choose {plan.name}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
