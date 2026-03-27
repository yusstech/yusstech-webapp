import type { Plan } from "@/types/database";

export interface PlanConfig {
  id: Plan;
  name: string;
  tagline: string;
  monthlyPrice: number; // in NGN kobo (smallest unit) — update with actual prices
  annualPrice: number;
  backups: string;
  pluginUpdates: string;
  supportResponse: string;
  changeRequestsPerMonth: number | "unlimited";
  monthlyReport: string;
  directMessaging: boolean;
  devHoursIncluded: number | "unlimited";
  paystackPlanCode: string; // set after creating plans in Paystack
}

export const PLANS: Record<Plan, PlanConfig> = {
  basic: {
    id: "basic",
    name: "Basic Care",
    tagline: "Essential cover for growing stores",
    monthlyPrice: 6500000,
    annualPrice: 70000000,
    backups: "Monthly",
    pluginUpdates: "Monthly",
    supportResponse: "48 hours",
    changeRequestsPerMonth: 1,
    monthlyReport: "Standard report",
    directMessaging: false,
    devHoursIncluded: 0,
    paystackPlanCode: "",
  },
  standard: {
    id: "standard",
    name: "Business Pro",
    tagline: "Built for stores that can't afford downtime",
    monthlyPrice: 8500000,
    annualPrice: 90000000,
    backups: "Weekly",
    pluginUpdates: "Bi-weekly",
    supportResponse: "24 hours",
    changeRequestsPerMonth: 2,
    monthlyReport: "Standard report",
    directMessaging: false,
    devHoursIncluded: 0,
    paystackPlanCode: "",
  },
  business: {
    id: "business",
    name: "Business Premium",
    tagline: "Full-service management, zero compromises",
    monthlyPrice: 10500000,
    annualPrice: 110000000,
    backups: "Daily",
    pluginUpdates: "Weekly",
    supportResponse: "Same day",
    changeRequestsPerMonth: 5,
    monthlyReport: "Performance report + recommendations",
    directMessaging: true,
    devHoursIncluded: 1,
    paystackPlanCode: "",
  },
  business_pro: {
    id: "business_pro",
    name: "Premium Pro",
    tagline: "Growth infrastructure for high-revenue stores",
    monthlyPrice: 16000000,
    annualPrice: 170000000,
    backups: "Real-time",
    pluginUpdates: "Continuous",
    supportResponse: "Same day",
    changeRequestsPerMonth: "unlimited",
    monthlyReport: "Report + strategy recommendations",
    directMessaging: true,
    devHoursIncluded: 3,
    paystackPlanCode: "",
  },
};

export const PLAN_ORDER: Plan[] = [
  "basic",
  "standard",
  "business",
  "business_pro",
];

export function getNextPlan(current: Plan): Plan | null {
  const idx = PLAN_ORDER.indexOf(current);
  if (idx === -1 || idx === PLAN_ORDER.length - 1) return null;
  return PLAN_ORDER[idx + 1];
}

export function getPlanAllowance(plan: Plan): number {
  const config = PLANS[plan];
  const limit = config.changeRequestsPerMonth;
  return limit === "unlimited" ? 999 : limit;
}

export function formatPrice(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}
