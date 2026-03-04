import type { Metadata, Viewport } from "next";
import I18nProvider from "@/components/i18n-provider";
import OfflineIndicator from "@/components/offline-indicator";
import SwRegister from "@/components/sw-register";
import AccessibilityInit from "@/components/accessibility-init";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "GeoChat",
  description:
    "Location-based conversations anchored to real-world coordinates",
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GeoChat",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-neutral-900 antialiased">
        <SwRegister />
        <I18nProvider>
          <AccessibilityInit>
            <OfflineIndicator />
            {children}
          </AccessibilityInit>
        </I18nProvider>
      </body>
    </html>
  );
}
