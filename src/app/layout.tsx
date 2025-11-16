import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CursorFluid } from "@/components/CursorFluid";
import ScrollReset from "@/components/ScrollReset";
import { hero } from "@/data/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const profileTitle = `${hero.name} — ${hero.role}`;
const profileDescription =
  `Portfolio for ${hero.name}, a creative developer crafting cinematic interfaces with Next.js, WebGL, and motion.`;

export const viewport: Viewport = {
  themeColor: "#050a12",
};

export const metadata: Metadata = {
  title: profileTitle,
  description: profileDescription,
  applicationName: hero.name,
  manifest: "/manifest.webmanifest",
  category: "portfolio",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: profileTitle,
    description:
      "Digital craftsmanship for immersive web experiences, powered by code, motion, and 3D storytelling.",
    url: "https://xerocore.dev",
    siteName: hero.name,
    images: [
      {
        url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200",
        width: 1200,
        height: 630,
        alt: `${hero.name} — ${hero.role}`,
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: [{ url: "/icon-192.png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: profileTitle,
  },
  metadataBase: new URL("https://xerocore.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}
      >
        <CursorFluid />
        <ScrollReset />
        {children}
      </body>
    </html>
  );
}
