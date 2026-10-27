import type { Metadata } from "next";

/** Only the operator-supplied origin is used; never infer a production domain. */
export function siteOrigin(): URL | undefined {
  const value = process.env.SITE_URL?.trim();
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
        url.pathname !== "/" || url.search || url.hash) throw new Error();
    return url;
  } catch { throw new Error("SITE_URL must be an HTTP(S) origin without credentials, path, query or fragment."); }
}

export function publicPageMetadata(title: string, description: string, path: string): Metadata {
  const origin = siteOrigin();
  const socialTitle = title.startsWith("TripCraft") ? title : `${title} | TripCraft`;
  const image = origin ? new URL("/hero/day-poster.webp", origin).href : undefined;
  return {
    title, description,
    ...(origin ? { metadataBase: origin, alternates: { canonical: new URL(path, origin).href } } : {}),
    openGraph: {
      title: socialTitle, description, siteName: "TripCraft", type: "website", locale: "en_US",
      ...(origin ? { url: new URL(path, origin).href } : {}),
      ...(image ? { images: [{ url: image, width: 1920, height: 1080, alt: "TripCraft illustrated travel landscape" }] } : {}),
    },
    twitter: { card: "summary_large_image", title: socialTitle, description, ...(image ? { images: [image] } : {}) },
  };
}
