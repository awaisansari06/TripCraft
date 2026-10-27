"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";
import type { TripInfo } from "@/app/create-new-trip/_components/types";

const destinationPhotos: [RegExp, string][] = [
  [/japan|tokyo|kyoto|osaka/i, "/light/07-tokyo-light.png"],
  [/goa|beach/i, "/light/02-beach-weekend-light.png"],
  [/paris|france/i, "/light/05-paris-light.png"],
  [/new york/i, "/light/06-new-york-light.png"],
  [/capri|amalfi/i, "/light/12-capri-itinerary-light.png"],
  [/rome|italy/i, "/light/08-rome-light.png"],
  [/dubai|uae/i, "/light/09-dubai-light.png"],
  [/agra|taj mahal/i, "/light/10-agra-light.png"],
  [/naples/i, "/light/11-naples-itinerary-light.png"],
];

const validTripImage = (value: unknown): value is string =>
  typeof value === "string" &&
  (value.startsWith("/") || /^https:\/\//i.test(value)) &&
  !value.includes("example.com") &&
  !value.startsWith("/api/google-place-detail?");

function getTripImage(destination: string, details?: Partial<TripInfo>) {
  const destinationPhoto = destinationPhotos.find(([pattern]) => pattern.test(destination))?.[1];
  if (destinationPhoto) return destinationPhoto;

  const hotelPhoto = details?.hotels?.map((hotel) => hotel.hotel_image_url).find(validTripImage);
  if (hotelPhoto) return hotelPhoto;

  const activityPhoto = details?.itinerary?.flatMap((day) => day.activities ?? [])
    .map((activity) => activity.place_image_url).find(validTripImage);
  return activityPhoto || "/beach.jpg";
}

export default function TripCard({ trip }: { trip: Doc<"TripDetailTable"> }) {
  const details = trip.tripDetail as Partial<TripInfo> | undefined;
  const destination = details?.destination || "Your destination";
  const duration = String(details?.duration || "").trim();
  const durationLabel = duration ? (/days?/i.test(duration) ? duration : `${duration} days`) : "";
  const preferredPhoto = getTripImage(destination, details);
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = imageFailed ? "/beach.jpg" : preferredPhoto;

  return (
    <Link href={`/create-new-trip?tripId=${encodeURIComponent(trip.tripId)}`} className="dashboard-trip-card tc-surface" aria-label={`View trip to ${destination}`}>
      <div className="dashboard-trip-image">
        <Image src={photoUrl} alt={`Travel inspiration for ${destination}`} fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" unoptimized onError={() => setImageFailed(true)} />
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
