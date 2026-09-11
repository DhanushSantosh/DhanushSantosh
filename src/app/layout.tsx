import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CursorFluid } from "@/components/CursorFluid";
import MotionProvider from "@/components/MotionProvider";
import ScrollReset from "@/components/ScrollReset";
import { brandConfig } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { hero, techStack } from "@/data/content";

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
// One canonical description, reused for the meta tag, OG card, Twitter
// card, and the Person JSON-LD below, instead of four separately-authored
// blurbs that can quietly drift apart (which is exactly how Google ended up
// indexing an old "Full-Stack AI Developer / ships AI copilots" snapshot
// long after the actual positioning had moved on — nothing forced the
// surfaces search engines read to stay in sync with each other, let alone
// with the page). hero.summary is already the honest, factual version used
// on the homepage itself, so this makes that the single source of truth.
const profileDescription = hero.summary;

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
    description: profileDescription,
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
// rich results and disambiguates against unrelated same-name results (a
// namesake actor plus at least one other same-name professional currently
// outrank this entity in Google's own knowledge panel — a fuller, evidenced
// Person node is one of the few direct levers available for that).
// - @id anchors this as one stable entity node other pages/JSON-LD could
//   reference, rather than an anonymous inline object.
// - description/image reuse the same real copy and photo the page itself
//   shows, so the structured data doesn't assert anything unverifiable.
// - knowsAbout lists only technologies actually demonstrated on this site
//   (the Expertise section, the AgentComms/DeskCrafter case studies, and
//   the Payoda internship's own stack) — not aspirational keywords.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${brandConfig.canonicalUrl}/#person`,
  name: hero.name,
  jobTitle: hero.role,
  description: hero.summary,
  url: brandConfig.canonicalUrl,
  image: `${brandConfig.canonicalUrl}/profile-photo.jpg`,
  sameAs: siteConfig.socialLinks.map((link) => link.href),
  knowsAbout: [...techStack.fullStack, "Python", "Django REST Framework", "PostgreSQL"],
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
        {/* Reveal (src/components/Reveal.tsx) renders its scroll-triggered
            content at opacity:0 in the initial server-rendered HTML — that's
            the intended behavior when JS is about to run and animate it in,
            but it means a genuinely no-JS visitor gets huge swaths of the
            page (every Reveal-wrapped section, which is most of the page)
            permanently invisible, since nothing ever transitions the inline
            style framer-motion would otherwise set. Every Reveal instance
            already carries this stable base class; overriding it here with
            !important (which does beat a plain, non-!important inline style)
            only fires when <noscript> applies, i.e. only for that no-JS case. */}
        <noscript>
          <style>{`.will-change-transform.will-change-opacity { opacity: 1 !important; transform: none !important; filter: none !important; }`}</style>
        </noscript>
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
