import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { UsersIcon, TicketIcon, LayoutDashboardIcon, LinkIcon } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/admin/clients", label: "Clients", icon: UsersIcon },
  { href: "/admin/requests", label: "Requests", icon: TicketIcon },
  { href: "/admin/payment-links", label: "Payment Links", icon: LinkIcon },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white flex flex-col">
        <div className="h-16 px-5 flex items-center border-b border-neutral-100">
          <div>
            <Image src="/logo.png" alt="YussTech" width={120} height={36} className="h-6 w-auto mb-0.5" />
            <span className="text-xs text-neutral-400">Admin</span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3">
          <ul className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                >
                  <Icon className="w-4 h-4 text-neutral-400" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-neutral-100 p-4">
          <UserButton showName />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
