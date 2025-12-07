import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CursorFluid } from "@/components/CursorFluid";
import ScrollReset from "@/components/ScrollReset";
import { hero } from "@/data/content";

const geistSans = localFont({
  src: "../../public/fonts/geist/GeistSans-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const geistMono = localFont({
  src: "../../public/fonts/geist/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  style: "normal",
  display: "swap",
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
  const bodyClassName = `${geistSans.className} ${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`;

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={bodyClassName}>
        <CursorFluid />
        <ScrollReset />
        {children}
      </body>
    </html>
  );
}
