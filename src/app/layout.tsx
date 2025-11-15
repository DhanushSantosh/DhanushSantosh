import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CursorFluid } from "@/components/CursorFluid";
import { DevtoolsCleaner } from "@/components/DevtoolsCleaner";
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

export const metadata: Metadata = {
  title: profileTitle,
  description: profileDescription,
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
  metadataBase: new URL("https://xerocore.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}
      >
        <CursorFluid />
        <DevtoolsCleaner />
        {children}
      </body>
    </html>
  );
}
