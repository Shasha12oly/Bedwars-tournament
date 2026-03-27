import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServerHeartbeatTrigger from "@/components/ServerHeartbeatTrigger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BedWars Tournament",
  description: "Register for BedWars tournaments. Defend your bed, break theirs, claim victory.",
  keywords: "BedWars, tournament, Minecraft, gaming, team registration, matches",
  authors: [{ name: "Sharmagaming" }],
  creator: "Sharmagaming",
  publisher: "Sharmagaming",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "BedWars Tournament Platform",
    description: "Professional BedWars tournament management with Discord integration",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: "BedWars Tournament",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BedWars Tournament Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BedWars Tournament Platform",
    description: "Professional BedWars tournament management with Discord integration",
    images: ["/og-image.jpg"],
    creator: "@sharmagaming",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#10b981',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-gradient-gaming text-slate-100">
    <ServerHeartbeatTrigger />
    {children}
  </body>
    </html>
  );
}
