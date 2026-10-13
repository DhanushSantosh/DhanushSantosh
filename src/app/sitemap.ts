import type { MetadataRoute } from "next";
import { brandConfig } from "@/config/brand";
import { caseStudies } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: brandConfig.canonicalUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${brandConfig.canonicalUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${brandConfig.canonicalUrl}/cv`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...caseStudies.map((study) => ({
      url: `${brandConfig.canonicalUrl}/projects/${study.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
