import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "PropGenius - Real Estate CRM for Indian Agencies",
    template: "%s | PropGenius",
  },
  description:
    "Manage listings, leads, WhatsApp follow-ups, team work, and reporting in one real estate CRM built for Indian agencies.",
  keywords: [
    "real estate",
    "listing generator",
    "CRM",
    "property management",
    "India",
    "WhatsApp integration",
    "lead management",
    "PropGenius",
  ],
  authors: [{ name: "PropGenius" }],
  creator: "PropGenius",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://propgenius.in"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "PropGenius",
    title: "PropGenius - Real Estate CRM for Indian Agencies",
    description:
      "Manage property listings, buyer leads, WhatsApp follow-ups, and reporting from one workspace for Indian real estate teams.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PropGenius real estate CRM dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PropGenius - Real Estate CRM for Indian Agencies",
    description:
      "Real estate CRM for listings, leads, WhatsApp follow-ups, and team reporting.",
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
