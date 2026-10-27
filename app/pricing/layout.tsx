import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = publicPageMetadata("Pricing", "Start planning trips for free. Upgrade to Premium for unlimited AI-generated itineraries, smarter planning, and premium travel insights.", "/pricing");
export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
