import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-metadata";
export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/create-new-trip", "/sign-in", "/sign-up"] }, ...(origin ? { sitemap: new URL("/sitemap.xml", origin).href } : {}) };
}
