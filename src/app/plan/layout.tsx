import PortalLayout from "@/components/shared/PortalLayout";

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayout>{children}</PortalLayout>;
}
