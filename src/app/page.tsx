import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PLANS, PLAN_ORDER } from "@/lib/plans";
import {
  CheckIcon,
  ShieldCheckIcon,
  ZapIcon,
  WrenchIcon,
  HeadphonesIcon,
  ArrowRightIcon,
} from "lucide-react";

function formatNGN(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-white text-neutral-900">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">YusTech</span>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative py-28 px-6 text-center overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          backgroundColor: "#fafafa",
        }}
      >
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-6">
            Managed WordPress · Nigeria
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-neutral-900 leading-tight mb-6">
            Your website running perfectly.
            <br />
            <span className="text-neutral-400">You focused on your business.</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-10 leading-relaxed">
            No more random downtime. No more chasing developers on WhatsApp. No
            more worrying about security or outdated plugins. YusTech handles
            your entire WordPress website so you don&apos;t have to.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-700 transition-colors text-sm"
            >
              Get started <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <a
              href="#plans"
              className="text-sm text-neutral-500 hover:text-neutral-900 px-4 py-3 transition-colors"
            >
              See our plans ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── Pain → Relief strip ── */}
      <section className="border-y border-neutral-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              q: "Is your site down right now?",
              a: "We monitor your website around the clock and respond before your customers even notice.",
            },
            {
              q: "Last plugin update was… when?",
              a: "Outdated plugins are the #1 cause of hacks. We update, test, and monitor them every week.",
            },
            {
              q: "Still getting support via WhatsApp?",
              a: "Your own client portal. Submit requests, track progress, and get same-day responses.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="flex flex-col gap-2">
              <p className="font-semibold text-neutral-900">{q}</p>
              <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="py-24 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Everything your website needs. Nothing you have to manage.
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-sm leading-relaxed">
              From servers to security to support — it&apos;s all included in your
              plan. One subscription, zero headaches.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ZapIcon,
                title: "Performance",
                body: "High-speed hosting, database cleanup, and speed optimisation — your site loads fast, every time.",
              },
              {
                icon: ShieldCheckIcon,
                title: "Security",
                body: "Real-time threat monitoring, firewall protection, and daily offsite backups keep your store safe.",
              },
              {
                icon: WrenchIcon,
                title: "Maintenance",
                body: "Plugin updates, domain renewals, and site health checks handled on a fixed schedule.",
              },
              {
                icon: HeadphonesIcon,
                title: "Support",
                body: "Dedicated 1-on-1 technical support — not a shared ticket queue. Your business, our priority.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <div className="font-semibold mb-1">{title}</div>
                  <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Up and running in 3 steps
          </h2>
          <p className="text-neutral-500 text-sm mb-14">
            Onboarding is fast. We do the heavy lifting.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            {[
              {
                step: "01",
                title: "Choose a plan",
                body: "Pick the tier that fits your business. All plans are billed annually and include full website management.",
              },
              {
                step: "02",
                title: "We set up your site",
                body: "We migrate your existing site or configure your new one — zero downtime, fully handled by us.",
              },
              {
                step: "03",
                title: "Focus on your business",
                body: "Log into your client portal anytime to submit requests, check performance reports, and renew.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-3">
                <span className="text-3xl font-bold text-neutral-200">{step}</span>
                <div className="font-semibold text-neutral-900">{title}</div>
                <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="plans" className="py-24 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-neutral-500 text-sm">
              All plans billed annually · NGN pricing · No hidden fees
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId];
              const isPopular = planId === "business";
              return (
                <div
                  key={planId}
                  className={`relative rounded-xl border bg-white flex flex-col p-6 gap-5 ${
                    isPopular
                      ? "border-neutral-900 ring-1 ring-neutral-900 shadow-sm"
                      : "border-neutral-200"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      Most popular
                    </span>
                  )}
                  <div>
                    <h3 className="font-semibold text-base">{plan.name}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{plan.tagline}</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-900">
                      {formatNGN(plan.annualPrice)}
                    </div>
                    <div className="text-xs text-neutral-400 mt-0.5">per year</div>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {[
                      `${plan.backups} backups`,
                      `${plan.pluginUpdates} plugin updates`,
                      `${plan.supportResponse} support response`,
                      `${
                        plan.changeRequestsPerMonth === "unlimited"
                          ? "Unlimited"
                          : plan.changeRequestsPerMonth
                      } change request${
                        plan.changeRequestsPerMonth !== 1 &&
                        plan.changeRequestsPerMonth !== "unlimited"
                          ? "s"
                          : ""
                      }/mo`,
                      ...(plan.directMessaging ? ["Direct messaging"] : []),
                      ...((plan.devHoursIncluded as number) > 0
                        ? [
                            `${plan.devHoursIncluded} dev hour${
                              plan.devHoursIncluded !== 1 ? "s" : ""
                            } included`,
                          ]
                        : []),
                    ].map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-neutral-600"
                      >
                        <CheckIcon className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/sign-up?plan=${planId}`}
                    className={`w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isPopular
                        ? "bg-neutral-900 text-white hover:bg-neutral-700"
                        : "border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    Get started
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-neutral-900 py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to hand off your website?
          </h2>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            Join Nigerian businesses that trust YusTech to keep their
            WordPress sites fast, secure, and always online.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-neutral-900 px-7 py-3.5 rounded-lg font-semibold hover:bg-neutral-100 transition-colors text-sm"
          >
            Get started today <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <span className="font-medium text-neutral-600">YusTech</span>
          <span>Managed WordPress for Nigerian businesses</span>
          <Link href="/sign-in" className="hover:text-neutral-700 transition-colors">
            Client login →
          </Link>
        </div>
      </footer>

    </main>
  );
}
