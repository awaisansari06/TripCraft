import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-metadata";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  if (!origin) return [];
  return ["/", "/pricing", "/contact-us", "/privacy-policy", "/terms-of-service"].map(path => ({ url: new URL(path, origin).href }));
}
