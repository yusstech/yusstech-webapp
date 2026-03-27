import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YusTech — Digital Products Built with Purpose",
  description:
    "YusTech builds websites, ecommerce, mobile apps, fintech, and software for Nigerian businesses — with a product mindset focused on your users and your growth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full bg-neutral-50 text-neutral-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
