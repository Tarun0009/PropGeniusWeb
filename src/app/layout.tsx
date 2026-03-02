import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "PropGenius AI - AI-Powered Real Estate Listing Generator",
    template: "%s | PropGenius AI",
  },
  description:
    "Generate professional property listings in seconds with AI. Manage leads with smart CRM, AI scoring, and WhatsApp integration. Built for Indian real estate.",
  keywords: [
    "real estate",
    "AI listing generator",
    "CRM",
    "property management",
    "India",
    "WhatsApp integration",
    "lead management",
    "PropGenius",
  ],
  authors: [{ name: "PropGenius AI" }],
  creator: "PropGenius AI",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://propgenius.in"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "PropGenius AI",
    title: "PropGenius AI - AI-Powered Real Estate Listing Generator",
    description:
      "Generate professional property listings in seconds with AI. Smart CRM with WhatsApp integration for Indian real estate.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PropGenius AI - AI-Powered Real Estate Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PropGenius AI - AI-Powered Real Estate Listing Generator",
    description:
      "Generate professional property listings in seconds with AI. Smart CRM for Indian real estate.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
