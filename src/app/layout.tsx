import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoChat",
  description:
    "Location-based conversations anchored to real-world coordinates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
