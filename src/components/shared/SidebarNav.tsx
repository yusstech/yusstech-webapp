"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  CreditCardIcon,
  LifeBuoyIcon,
  StarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/plan", label: "My Plan", icon: StarIcon },
  { href: "/billing", label: "Billing", icon: CreditCardIcon },
  { href: "/support", label: "Support", icon: LifeBuoyIcon },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-4 px-3">
      <ul className="space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-neutral-100 text-neutral-900 font-medium"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    active ? "text-neutral-700" : "text-neutral-400"
                  )}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
