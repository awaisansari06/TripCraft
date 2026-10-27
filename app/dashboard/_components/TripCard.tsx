"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import type { TripInfo } from "@/app/create-new-trip/_components/types";
import TravelArtwork from "@/components/TravelArtwork";
import { travelArtworkSrc } from "@/lib/travel-artwork";

const destinationPhotos: [RegExp, string][] = [
  [/japan|tokyo|kyoto|osaka/i, "07-tokyo"],
  [/goa|beach/i, "02-beach-weekend"],
  [/paris|france/i, "05-paris"],
  [/new york/i, "06-new-york"],
  [/capri|amalfi/i, "12-capri-itinerary"],
  [/rome|italy/i, "08-rome"],
  [/dubai|uae/i, "09-dubai"],
  [/agra|taj mahal/i, "10-agra"],
  [/naples/i, "11-naples-itinerary"],
];

const validTripImage = (value: unknown): value is string =>
  typeof value === "string" &&
  (value.startsWith("/") || /^https:\/\//i.test(value)) &&
  !value.includes("example.com") &&
  !value.startsWith("/api/google-place-detail?");

function getTripImage(details?: Partial<TripInfo>) {
  const hotelPhoto = details?.hotels?.map((hotel) => hotel.hotel_image_url).find(validTripImage);
  if (hotelPhoto) return hotelPhoto;

  const activityPhoto = details?.itinerary?.flatMap((day) => day.activities ?? [])
    .map((activity) => activity.place_image_url).find(validTripImage);
  return activityPhoto || travelArtworkSrc("02-beach-weekend");
}

export default function TripCard({ trip }: { trip: Doc<"TripDetailTable"> }) {
  const details = trip.tripDetail as Partial<TripInfo> | undefined;
  const destination = details?.destination || "Your destination";
  const duration = String(details?.duration || "").trim();
  const durationLabel = duration ? (/days?/i.test(duration) ? duration : `${duration} days`) : "";
  const artwork = destinationPhotos.find(([pattern]) => pattern.test(destination))?.[1];
  const preferredPhoto = getTripImage(details);
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = imageFailed ? travelArtworkSrc("02-beach-weekend") : preferredPhoto;

  return (
    <Link href={`/create-new-trip?tripId=${encodeURIComponent(trip.tripId)}`} className="dashboard-trip-card tc-surface" aria-label={`View trip to ${destination}`}>
      <div className="dashboard-trip-image">
        {artwork ? <TravelArtwork asset={artwork} sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" /> :
          <Image src={photoUrl} alt={`Travel inspiration for ${destination}`} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" unoptimized onError={() => setImageFailed(true)} />}
        <span className="dashboard-trip-badge"><Clock size={13} aria-hidden="true" /> Planned</span>
      </div>
      <div className="dashboard-trip-body">
        <div>
          <h3 title={destination}>{destination}</h3>
          <div className="dashboard-trip-meta">
            {durationLabel && <span>{durationLabel}</span>}
            {details?.budget && <span>{details.budget}</span>}
          </div>
        </div>
        <div className="dashboard-trip-footer">
          <div>
            <span>{details?.group_size || "Your itinerary"}</span>
            <time dateTime={new Date(trip._creationTime).toISOString()}>{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(trip._creationTime)}</time>
          </div>
          <strong>View trip <ArrowUpRight size={16} aria-hidden="true" /></strong>
        </div>
      </div>
    </Link>
  );
}
