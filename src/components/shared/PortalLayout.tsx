import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import SidebarNav from "./SidebarNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white flex flex-col">
        <div className="h-16 px-5 flex items-center border-b border-neutral-100">
          <Image src="/logo.png" alt="YussTech" width={120} height={36} className="h-7 w-auto" />
        </div>
        <SidebarNav />
        <div className="border-t border-neutral-100 p-4">
          <UserButton showName />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
