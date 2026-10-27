"use client";
import { PricingTable } from "@clerk/nextjs";
import { Globe, Map, Bookmark, Sparkles } from "lucide-react";
import SiteFooter from "../_components/SiteFooter";
import PageIntro from "../_components/PageIntro";
export default function Pricing() {
  return (
    <main className="tc-page tc-warm-page" data-page-motion>
      <PageIntro icon={<Globe size={16} aria-hidden="true" />} eyebrow="AI-powered trip planning"
        description="Start for free. Upgrade when you’re ready for unlimited trips, smarter itineraries, and premium travel insights.">
        Your next adventure.<br />{" "}<em>Your perfect plan.</em>
      </PageIntro>
      <section
        className="tc-container tc-pricing"
        aria-label="TripCraft subscription plans"
      >
        <PricingTable
          appearance={{
            elements: {
              rootBox: "tc-pricing-root",
              pricingTable: "tc-pricing-grid",
              pricingTableCard: "tc-pricing-card",
              pricingTableCardHeader: "tc-pricing-card-header",
              pricingTableCardTitle: "tc-pricing-card-title",
              pricingTableCardFee: "tc-pricing-fee",
              pricingTableCardFeePeriod: "tc-pricing-period",
              pricingTableCardFeePeriodNotice: "tc-pricing-period",
              pricingTableCardBody: "tc-pricing-card-body",
              pricingTableCardFeatures: "tc-pricing-features",
              pricingTableCardFooter: "tc-pricing-card-footer",
              pricingTableCardFooterButton: "tc-pricing-cta",
            },
            variables: {
              colorPrimary: "var(--app-action)",
              colorPrimaryForeground: "var(--app-on-action)",
              colorBackground: "var(--tc-surface-solid)",
              colorText: "var(--tc-ink)",
              colorTextSecondary: "var(--tc-muted)",
              colorNeutral: "var(--tc-ink)",
              fontFamily: "Geist, sans-serif",
              borderRadius: "14px",
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
