import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function DashboardHero() {
  return (
    <section className="dashboard-hero" aria-labelledby="dashboard-title" data-reveal>
      <div className="dashboard-hero-copy">
        <span className="tc-eyebrow"><Sparkles size={16} /> Your travel space</span>
        <h1 id="dashboard-title">Your journeys,<br /><em>all in one place.</em></h1>
        <p>Return to your plans, revisit the places you loved, and find the next adventure worth taking.</p>
        <Link href="/create-new-trip" className="tc-button dashboard-hero-action">
          Plan a new trip <ArrowUpRight size={18} />
        </Link>
      </div>
      <span className="dashboard-hero-caption" aria-hidden="true">Made for the moments that move you.</span>
    </section>
  );
}
