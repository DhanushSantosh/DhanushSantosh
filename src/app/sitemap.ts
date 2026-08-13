import type { MetadataRoute } from "next";
import { brandConfig } from "@/config/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: brandConfig.canonicalUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${brandConfig.canonicalUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${brandConfig.canonicalUrl}/cv`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
