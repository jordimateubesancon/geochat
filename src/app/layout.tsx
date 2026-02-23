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
    <html lang="en" className="dark">
      <body className="bg-neutral-900 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
