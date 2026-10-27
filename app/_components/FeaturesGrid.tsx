"use client";

import React, { useState } from "react";
import {
  Hotel,
  Map,
  Wallet,
  Sparkles,
  Users,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type FeatureKey =
  | "hotels"
  | "itinerary"
  | "budget"
  | "gems"
  | "group"
  | "save";

const FEATURES: Record<
  FeatureKey,
  {
    icon: React.ReactNode;
    title: string;
    desc: string;
    bullets: string[];
    cta: string;
  }
> = {
  hotels: {
    icon: <Hotel className="w-6 h-6 text-blue-600" />,
    title: "Hotel recommendations",
    desc: "Get curated hotel stays based on your budget and style.",
    bullets: [
      "AI-matched hotels based on your budget",
      "Location & vibe-aware recommendations",
      "Ratings, price range & map view included",
    ],
    cta: "Find hotels for my trip",
  },
  itinerary: {
    icon: <Map className="w-6 h-6 text-green-600" />,
    title: "Smart itinerary builder",
    desc: "Day-by-day plans optimized for travel time and enjoyment.",
    bullets: [
      "Morning / afternoon / evening planning",
      "Optimized routes to save time",
      "Balanced pacing — not rushed",
    ],
    cta: "Build my itinerary",
  },
  budget: {
    icon: <Wallet className="w-6 h-6 text-orange-600" />,
    title: "Budget planning",
    desc: "Estimate daily costs to keep your trip pocket-friendly.",
    bullets: [
      "Daily & total cost estimates",
      "Hotel + activities combined budget",
      "Avoid overspending surprises",
    ],
    cta: "Plan within my budget",
  },
  gems: {
    icon: <Sparkles className="w-6 h-6 text-purple-600" />,
    title: "Hidden gems suggestions",
    desc: "Discover off-the-beaten-path spots that locals love.",
    bullets: [
      "Non-touristy places",
      "Local favorites & secret spots",
      "Perfect for explorers",
    ],
    cta: "Discover hidden gems",
  },
  group: {
    icon: <Users className="w-6 h-6 text-pink-600" />,
    title: "Group trip planning",
    desc: "Easily plan for solo travelers, couples, or groups.",
    bullets: [
      "Couples, friends & family trips",
      "Balanced preferences",
      "Flexible group pacing",
    ],
    cta: "Plan a group trip",
  },
  save: {
    icon: <Bookmark className="w-6 h-6 text-indigo-600" />,
    title: "Save and view trips later",
    desc: "Access your saved itineraries anytime from your dashboard.",
    bullets: [
      "Cloud-saved itineraries",
      "Edit trips anytime",
      "Accessible from dashboard",
    ],
    cta: "View my saved trips",
  },
};

export default function FeaturesGrid() {
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);

  return (
    <section className="py-20 bg-muted/30 dark:bg-black/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From inspiration to detailed daily plans, we&apos;ve got you covered.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(Object.keys(FEATURES) as FeatureKey[]).map((key) => {
            const feature = FEATURES[key];
            return (
              <div
                key={key}
                className="p-6 glass hover:shadow-xl hover:-translate-y-1 hover:bg-white/75 dark:hover:bg-zinc-900/75 transition-all duration-300 group flex flex-col h-full border border-white/40 dark:border-white/10 rounded-2xl"
              >
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4 grow">
                  {feature.desc}
                </p>

                <button
                  onClick={() => setActiveFeature(key)}
                  className="flex items-center gap-1 text-sm font-semibold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Modal */}
      <Dialog open={!!activeFeature} onOpenChange={() => setActiveFeature(null)}>
        {activeFeature && (
          <DialogContent className="max-w-lg rounded-2xl bg-card border border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {FEATURES[activeFeature].title}
              </DialogTitle>
            </DialogHeader>

            <p className="text-muted-foreground mb-6">
              {FEATURES[activeFeature].desc}
            </p>

            <ul className="space-y-3 mb-6">
              {FEATURES[activeFeature].bullets.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-green-500 mt-1">✔</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <Link href="/create-new-trip">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl py-6 text-base font-semibold">
                {FEATURES[activeFeature].cta}
              </Button>
            </Link>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
