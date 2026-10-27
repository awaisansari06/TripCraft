import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Ticket, Clock, Star } from "lucide-react";
import type { Activity } from "./types";
import { travelArtworkSrc } from "@/lib/travel-artwork";

type Props = {
    activity: Activity;
    onSelect: (image: string, images: string[]) => void;
};

function PlaceCardItem({ activity, onSelect }: Props) {
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);

    useEffect(() => {
        if (!activity?.place_name) return;
        const controller = new AbortController();
        const getPhotos = async () => {
        try {
            const result = await axios.post("/api/google-place-detail", {
                placeName: activity?.place_name,
            }, { signal: controller.signal });

            if (result?.data?.error) return;

            // Handle array or legacy string response
            const data = result?.data;
            if (Array.isArray(data)) {
                setPhotoUrls(data);
            } else if (typeof data === 'string') {
                setPhotoUrls([data]);
            }
        } catch {
            // Silently fail - use fallback image
        }
        };
        void getPhotos();
        return () => controller.abort();
    }, [activity?.place_name]);

    const imageSrc =
        (photoUrls.length > 0 ? photoUrls[0] : null) ||
        (activity?.place_image_url && !activity.place_image_url.includes("example.com")
            ? activity.place_image_url
            : travelArtworkSrc("04-mountain-escape"));

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`View details for ${activity?.place_name}`}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(imageSrc, photoUrls.length > 0 ? photoUrls : [imageSrc]); } }}
            onClick={() => onSelect(imageSrc, photoUrls.length > 0 ? photoUrls : [imageSrc])}
            className="tc-place-card group"
        >
            <div className="tc-place-card-image">
                <Image
                    src={imageSrc}
                    alt={activity?.place_name || "Place Image"}
                    fill
                    sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                    onError={() => setPhotoUrls([travelArtworkSrc("04-mountain-escape")])}
                />
            </div>

            <div className="p-4 flex flex-col gap-2 min-h-[160px] justify-between">
                <div>
                    <h3 className="tc-place-card-title">{activity?.place_name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {activity?.place_details}
                    </p>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                        <p className="tc-place-price"><Ticket size={14} aria-hidden="true" /> {activity?.ticket_pricing}</p>
                        <p className="tc-place-rating"><Star size={14} aria-hidden="true" /> {activity?.best_time_to_visit ? activity.best_time_to_visit : "Top Pick"}</p>
                    </div>
                    <p className="tc-place-location"><Clock size={13} aria-hidden="true" /> {activity?.time_travel_each_location}</p>
                </div>
            </div>
        </div>
    );
}
export default PlaceCardItem;
