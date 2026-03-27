import PortalLayout from "@/components/shared/PortalLayout";

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayout>{children}</PortalLayout>;
}
