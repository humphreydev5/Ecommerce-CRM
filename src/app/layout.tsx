
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cogent CRM",
  description:
    "Customer, order and business management workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
