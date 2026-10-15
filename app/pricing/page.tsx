"use client";
import { PricingTable } from "@clerk/nextjs";
import { Globe, Map, Bookmark, Sparkles } from "lucide-react";
import SiteFooter from "../_components/SiteFooter";
export default function Pricing() {
  return (
    <main className="tc-page" data-page-motion>
      <section className="tc-page-hero">
        <span className="tc-eyebrow">
          <Globe size={16} /> AI-powered trip planning
        </span>
        <h1>
          Your next adventure.
          <br />
          <em>Your perfect plan.</em>
        </h1>
        <p>
          Start for free. Upgrade when you’re ready for unlimited trips, smarter
          itineraries, and premium travel insights.
        </p>
      </section>
      <section
        className="tc-container tc-pricing"
        aria-label="TripCraft subscription plans"
      >
        <PricingTable
          appearance={{
            variables: {
              colorPrimary: "#f5692b",
              colorBackground: "var(--tc-surface-solid)",
              colorText: "var(--tc-ink)",
              colorTextSecondary: "var(--tc-muted)",
              colorNeutral: "var(--tc-ink)",
              fontFamily: "var(--font-outfit), sans-serif",
              borderRadius: "18px",
            },
          }}
        />
      </section>
      <section className="tc-container tc-plan-details">
        <div data-reveal data-stagger="0">
          <Map />
          <h2>Made around you</h2>
          <p>
            Personal itineraries shaped around your interests, budget, and pace.
          </p>
        </div>
        <div data-reveal data-stagger="1">
          <Bookmark />
          <h2>Keep your inspiration</h2>
          <p>
            Return to your saved trips and favorite places when you’re ready.
          </p>
        </div>
        <div data-reveal data-stagger="2">
          <Sparkles />
          <h2>More time exploring</h2>
          <p>Let your AI travel assistant help with the details.</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
