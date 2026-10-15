"use client";

import { useContext, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Search, ArrowUpDown, ArrowDown } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { UserDetailContext } from "@/context/UserDetailContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TripCard from "./TripCard";
import EmptyState from "./EmptyState";
import StatsOverview from "./StatsOverview";

export default function UserTrips() {
  const { userDetail } = useContext(UserDetailContext);
  const trips = useQuery(api.tripDetail.GetUserTrips, userDetail ? { uid: userDetail._id } : "skip");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredTrips = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return [...(trips ?? [])]
      .filter((trip) => String(trip.tripDetail?.destination ?? "").toLocaleLowerCase().includes(query))
      .sort((a, b) => sortOrder === "newest" ? b._creationTime - a._creationTime : a._creationTime - b._creationTime);
  }, [trips, searchQuery, sortOrder]);

  return (
    <section className="dashboard-section" aria-labelledby="dashboard-trips-title" data-reveal>
      <div className="dashboard-section-heading">
        <div>
          <span className="tc-eyebrow">Your journeys</span>
          <h2 id="dashboard-trips-title">My <em>trips</em></h2>
          <p>All the places you have imagined, ready to revisit.</p>
        </div>
        {!!trips?.length && <StatsOverview totalTrips={trips.length} />}
      </div>

      {trips === undefined ? (
        <div className="dashboard-card-grid" role="status" aria-label="Loading your trips">
          {[0, 1, 2].map((item) => <div className="dashboard-skeleton" key={item} />)}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="tc-surface dashboard-panel">
          <div className="dashboard-controls">
            <label className="dashboard-search">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Search trips by destination</span>
              <input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setVisibleCount(6); }} placeholder="Search destinations" />
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger className="dashboard-sort" aria-label="Sort trips">
                <ArrowUpDown size={17} aria-hidden="true" />
                {sortOrder === "newest" ? "Newest first" : "Oldest first"}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder("newest")}>Newest first</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Oldest first</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {filteredTrips.length ? (
            <div className="dashboard-card-grid">
              {filteredTrips.slice(0, visibleCount).map((trip) => <TripCard key={trip._id} trip={trip} />)}
            </div>
          ) : (
            <p className="dashboard-no-results" role="status">No trips match “{searchQuery}”. Try another destination.</p>
          )}
          {visibleCount < filteredTrips.length && (
            <button className="dashboard-load-more" onClick={() => setVisibleCount((count) => count + 6)}>
              Show more trips <ArrowDown size={17} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
