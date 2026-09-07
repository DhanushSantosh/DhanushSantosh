import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CursorFluid } from "@/components/CursorFluid";
import MotionProvider from "@/components/MotionProvider";
import ScrollReset from "@/components/ScrollReset";
import { brandConfig } from "@/config/brand";
import { siteConfig } from "@/config/site";
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

const profileTitle = `${hero.name} - ${hero.role}`;
const profileDescription =
  `Portfolio for ${hero.name}, a creative developer crafting cinematic interfaces with Next.js, WebGL, and motion.`;

export const viewport: Viewport = {
  themeColor: "#050a12",
};

export const metadata: Metadata = {
  title: {
    default: profileTitle,
    // Subpages (About, CV) set a short title like "About Me"; this keeps
    // the brand name in the tab title and search snippet instead of losing
    // it entirely on every page but the homepage.
    template: `%s | ${hero.name}`,
  },
  description: profileDescription,
  applicationName: hero.name,
  manifest: "/manifest.webmanifest",
  category: "portfolio",
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: brandConfig.canonicalUrl,
  },
  openGraph: {
    title: profileTitle,
    description:
      "Digital craftsmanship for immersive web experiences, powered by code, motion, and 3D storytelling.",
    url: brandConfig.canonicalUrl,
    siteName: hero.name,
    images: [
      {
        url: "/api/brand-preview",
        width: 1200,
        height: 630,
        alt: `${hero.name} - ${hero.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: profileTitle,
    description: profileDescription,
    images: ["/api/brand-preview"],
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
  metadataBase: new URL(brandConfig.canonicalUrl),
};

// Person schema so search engines can resolve "Dhanush Santosh" as an
// entity (name, role, homepage, social profiles) rather than just indexing
// unstructured page text — improves eligibility for knowledge-panel-style
// rich results and disambiguates against unrelated same-name results.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: hero.name,
  jobTitle: hero.role,
  url: brandConfig.canonicalUrl,
  sameAs: siteConfig.socialLinks.map((link) => link.href),
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-full focus:border focus:border-white/20 focus:bg-black focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-[0_0_30px_rgba(0,0,0,0.8)] focus:outline focus:outline-2 focus:outline-white"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <div id="site-cursor" aria-hidden="true" data-visible="false" data-state="default">
          <div className="site-cursor-orbit" />
          <div className="site-cursor-core" />
        </div>
        <CursorFluid />
        <ScrollReset />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
