import { Plane } from "lucide-react";

export default function StatsOverview({ totalTrips }: { totalTrips: number }) {
  return (
    <div className="dashboard-stat" aria-label={`${totalTrips} saved ${totalTrips === 1 ? "trip" : "trips"}`}>
      <span className="dashboard-stat-icon"><Plane size={19} strokeWidth={1.8} /></span>
      <span className="dashboard-stat-value">{totalTrips}</span>
      <span className="dashboard-stat-label">{totalTrips === 1 ? "trip planned" : "trips planned"}</span>
    </div>
  );
}
