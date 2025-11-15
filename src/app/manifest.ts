import type { MetadataRoute } from "next";
import { hero } from "@/data/content";

export default function manifest(): MetadataRoute.Manifest {
  const name = `${hero.name} — ${hero.role}`;
  const description = `Immersive portfolio for ${hero.name}, showcasing cinematic product storytelling with code, motion, and 3D.`;
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
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1280",
        sizes: "1280x720",
        type: "image/jpeg",
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
        description: "Book new collaborations",
      },
    ],
  };
}
