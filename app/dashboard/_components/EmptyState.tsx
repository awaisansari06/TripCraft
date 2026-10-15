import Link from "next/link";
import { ArrowRight, Plane } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="dashboard-empty tc-surface">
      <span className="dashboard-empty-icon"><Plane size={30} strokeWidth={1.8} /></span>
      <span className="tc-eyebrow">A blank page for your next adventure</span>
      <h2>No trips planned <em>yet.</em></h2>
      <p>Tell us where you want to go and we’ll help you turn the idea into an itinerary.</p>
      <Link href="/create-new-trip" className="tc-button">Plan your first trip <ArrowRight size={18} /></Link>
    </div>
  );
}
