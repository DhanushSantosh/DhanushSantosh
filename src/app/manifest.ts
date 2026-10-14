import type { MetadataRoute } from "next";
import { hero } from "@/data/content";

export default function manifest(): MetadataRoute.Manifest {
  const name = `${hero.name} — ${hero.role}`;
  const description = hero.summary;
  return {
    name,
    short_name: hero.name,
    description,
    start_url: "/",
    display: "standalone",
    background_color: "#050a12",
    theme_color: "#050a12",
    lang: "en",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/api/brand-preview?variant=wide",
        sizes: "1280x720",
        type: "image/png",
        label: "Hero landing screen",
      },
    ],
    categories: ["portfolio", "productivity"],
    shortcuts: [
      {
        name: "Projects",
        url: "/#projects",
        description: "Jump directly to featured work",
      },
      {
        name: "Contact",
        url: "/#contact",
        description: "Get in touch",
      },
    ],
  };
}
