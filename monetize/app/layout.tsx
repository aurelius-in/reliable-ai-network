import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { ReferralCapture } from "@/components/ReferralCapture";
import { AccessCodeCapture } from "@/components/AccessCodeCapture";
import { CookieNotice } from "@/components/CookieNotice";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://makeitrainapp.com"
).replace(/\/$/, "");

const DEFAULT_DESCRIPTION =
  "Find who may pay, stress-test the offer, and the next conversation worth having. Paste your URL. Run it on my product, free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "You built something real. Now it's time to get paid. Make it RAIN.",
    template: "%s | Make it RAIN",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "Make it RAIN",
  authors: [{ name: "Reliable AI Network, LLC" }],
  creator: "Reliable AI Network, LLC",
  publisher: "Reliable AI Network, LLC",
  category: "business",
  appleWebApp: {
    capable: true,
    title: "Make it RAIN",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png?v=3", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png?v=3", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Make it RAIN",
    title: "You built something real. Now it's time to get paid. Make it RAIN.",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "You built something real. Now it's time to get paid. Make it RAIN.",
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070a12",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={`${outfit.className} min-h-screen antialiased`}>
        <Suspense fallback={null}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Suspense>
        <Suspense fallback={null}>
          <ReferralCapture />
        </Suspense>
        <Suspense fallback={null}>
          <AccessCodeCapture />
        </Suspense>
        <CookieNotice />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
