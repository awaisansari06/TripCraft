import Link from "next/link";
import { ArrowUpRight, Compass, Map, Palmtree, Plus } from "lucide-react";

const actions = [
  { name: "Create a trip", description: "Start with your own idea", icon: Plus, href: "/create-new-trip" },
  { name: "Inspire me", description: "See where the journey goes", icon: Compass, href: "/create-new-trip?type=inspire" },
  { name: "Hidden gems", description: "Find somewhere unexpected", icon: Map, href: "/create-new-trip?type=hidden-gems" },
  { name: "Adventure", description: "Take the scenic route", icon: Palmtree, href: "/create-new-trip?type=adventure" },
];

export default function QuickActions() {
  return (
    <section className="dashboard-section" aria-labelledby="dashboard-actions-title">
      <div className="dashboard-section-heading" data-reveal>
        <div>
          <span className="tc-eyebrow">Go somewhere new</span>
          <h2 id="dashboard-actions-title">Where to <em>next?</em></h2>
        </div>
        <p>Pick a direction. TripCraft will help with the details.</p>
      </div>
      <div className="dashboard-action-grid">
        {actions.map(({ name, description, icon: Icon, href }, index) => (
          <Link className="dashboard-action tc-surface" href={href} key={name} data-reveal data-stagger={index}>
            <span className="dashboard-action-icon"><Icon size={23} strokeWidth={1.8} /></span>
            <span className="dashboard-action-label">{name}</span>
            <span className="dashboard-action-description">{description}</span>
            <ArrowUpRight className="dashboard-action-arrow" size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
