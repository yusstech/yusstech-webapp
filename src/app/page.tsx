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
  MonitorIcon,
  ShoppingBagIcon,
  SmartphoneIcon,
  CreditCardIcon,
  BoxIcon,
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
          backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          backgroundColor: "#fafafa",
        }}
      >
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-6">
            Digital Products · Built with Purpose
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-neutral-900 leading-tight mb-6">
            We build products
            <br />
            <span className="text-neutral-400">that work for your business.</span>
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Websites. Ecommerce. Mobile apps. Fintech. Software. Whatever your
            business needs, we build it with a product mindset — focused on your
            users, your goals, and your growth. Not just code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-700 transition-colors text-sm"
            >
              Start a project <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <a
              href="#services"
              className="text-sm text-neutral-500 hover:text-neutral-900 px-4 py-3 transition-colors"
            >
              What we build ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── What we build ── */}
      <section id="services" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              One team. Every digital need.
            </h2>
            <p className="text-neutral-500 text-sm max-w-xl mx-auto leading-relaxed">
              From your first landing page to a full-scale fintech platform — we
              think in products, not just deliverables.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                icon: MonitorIcon,
                title: "Websites",
                body: "Corporate sites, portfolios, and landing pages built to convert and impress.",
              },
              {
                icon: ShoppingBagIcon,
                title: "Ecommerce",
                body: "Online stores that sell — fast, reliable, and designed for Nigerian buyers.",
              },
              {
                icon: SmartphoneIcon,
                title: "Mobile Apps",
                body: "iOS and Android apps built around real user behaviour and business logic.",
              },
              {
                icon: CreditCardIcon,
                title: "Fintech",
                body: "Payment systems, wallets, and financial tools built to regulation-grade standards.",
              },
              {
                icon: BoxIcon,
                title: "Software",
                body: "SaaS platforms, internal tools, and custom systems that scale with your operation.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-neutral-50 border border-neutral-100 rounded-xl p-6 flex flex-col gap-4 hover:border-neutral-300 transition-colors"
              >
                <div className="w-9 h-9 bg-white border border-neutral-200 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-neutral-700" />
                </div>
                <div>
                  <div className="font-semibold mb-1">{title}</div>
                  <p className="text-xs text-neutral-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product mindset ── */}
      <section className="py-24 px-6 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4 block">
                Our approach
              </span>
              <h2 className="text-3xl font-bold tracking-tight mb-5 leading-snug">
                We don&apos;t just build what you ask for.
                <br />
                <span className="text-neutral-400">We build what you need.</span>
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-5 text-sm">
                Most developers take a brief and write code. We take your brief,
                ask hard questions about your users and your goals, then design
                a product that actually solves the problem — not just the
                symptoms.
              </p>
              <p className="text-neutral-500 leading-relaxed text-sm">
                That means fewer re-builds, faster growth, and a digital product
                that becomes a real asset to your business.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Strategy first", desc: "We define the problem before writing a line of code." },
                { label: "User-centred design", desc: "Built for the people who will actually use it." },
                { label: "Built to scale", desc: "Architecture that grows as your business does." },
                { label: "Ongoing support", desc: "We stay with you — maintenance, updates, and improvements." },
              ].map(({ label, desc }) => (
                <div
                  key={label}
                  className="bg-white border border-neutral-200 rounded-xl p-5"
                >
                  <div className="font-semibold text-sm mb-1">{label}</div>
                  <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What's included post-launch ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              We don&apos;t disappear after launch.
            </h2>
            <p className="text-neutral-500 text-sm max-w-xl mx-auto leading-relaxed">
              Every product we build comes with an option to stay on. Security,
              performance, maintenance, and support — all managed for you.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ZapIcon,
                title: "Performance",
                body: "Fast hosting, speed optimisation, and database tuning so your product never slows down.",
              },
              {
                icon: ShieldCheckIcon,
                title: "Security",
                body: "Real-time threat monitoring, automatic backups, and proactive vulnerability patching.",
              },
              {
                icon: WrenchIcon,
                title: "Maintenance",
                body: "Regular updates, domain management, and health checks handled on a fixed schedule.",
              },
              {
                icon: HeadphonesIcon,
                title: "Support",
                body: "A dedicated point of contact — not a shared inbox. Your product gets proper attention.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-neutral-50 border border-neutral-100 rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="w-9 h-9 bg-white border border-neutral-200 rounded-lg flex items-center justify-center">
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
      <section className="py-24 px-6 bg-neutral-50 border-t border-neutral-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            How we work
          </h2>
          <p className="text-neutral-500 text-sm mb-14">
            Simple process. No surprises.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            {[
              {
                step: "01",
                title: "Tell us what you need",
                body: "Share your idea, problem, or goal. We ask the right questions to understand your users and your business.",
              },
              {
                step: "02",
                title: "We design and build it",
                body: "Strategy, design, development — handled end-to-end. You stay in the loop without managing the details.",
              },
              {
                step: "03",
                title: "Launch, then grow",
                body: "We launch your product and stay with you — maintaining, improving, and scaling as your business grows.",
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

      {/* ── Maintenance Plans ── */}
      <section id="plans" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3 block">
              Ongoing support plans
            </span>
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Keep your product in peak condition
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
                      `${plan.pluginUpdates} updates`,
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
            Have an idea? Let&apos;s build it.
          </h2>
          <p className="text-neutral-400 mb-8 leading-relaxed">
            Whether it&apos;s your first website or your next big product —
            YusTech brings the strategy, design, and engineering to make it real.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-neutral-900 px-7 py-3.5 rounded-lg font-semibold hover:bg-neutral-100 transition-colors text-sm"
          >
            Start a project <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <span className="font-medium text-neutral-600">YusTech</span>
          <span>Websites · Ecommerce · Mobile · Fintech · Software</span>
          <Link href="/sign-in" className="hover:text-neutral-700 transition-colors">
            Client login →
          </Link>
        </div>
      </footer>

    </main>
  );
}
