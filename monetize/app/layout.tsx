import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAIN Monetize — Make It Rain",
  description:
    "Turn your AI creations into income using the exact frameworks top marketers use — now automated for you. Start your free 30-day Pro trial.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
