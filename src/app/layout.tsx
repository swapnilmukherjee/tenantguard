import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TenantGuard | Auth0 IAM Console",
  description:
    "A portfolio-grade Auth0 IAM reference app for B2B SaaS authorization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
