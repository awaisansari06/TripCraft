import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Activity } from "./types";

type Props = {
    activity: Activity;
    onSelect: (image: string, images: string[]) => void;
};

function PlaceCardItem({ activity, onSelect }: Props) {
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);

    useEffect(() => {
        if (activity?.place_name) GetGooglePlaceDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activity?.place_name]);

    const GetGooglePlaceDetail = async () => {
        try {
            const result = await axios.post("/api/google-place-detail", {
                placeName: activity?.place_name,
            });

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

    const imageSrc =
        (photoUrls.length > 0 ? photoUrls[0] : null) ||
        (activity?.place_image_url && !activity.place_image_url.includes("example.com")
            ? activity.place_image_url
            : "/mountains.jpg");

    return (
        <div
            onClick={() => onSelect(imageSrc, photoUrls.length > 0 ? photoUrls : [imageSrc])}
            className="hover:scale-[1.02] transition-all cursor-pointer border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-zinc-900 overflow-hidden group"
        >
            <div className="relative h-[180px] w-full bg-gray-100 dark:bg-zinc-800">
                <Image
                    src={imageSrc}
                    alt={activity?.place_name || "Place Image"}
                    fill
                    sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                    onError={() => setPhotoUrls(["/mountains.jpg"])}
                />
            </div>

            <div className="p-4 flex flex-col gap-2 min-h-[160px] justify-between">
                <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{activity?.place_name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {activity?.place_details}
                    </p>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">🎫 {activity?.ticket_pricing}</p>
                        <p className="text-sm text-amber-500 dark:text-amber-400 font-bold break-words">⭐ {activity?.best_time_to_visit ? activity.best_time_to_visit : "Top Pick"}</p>
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium truncate">⏰ {activity?.time_travel_each_location}</p>
                </div>
            </div>
        </div>
    );
}
export default PlaceCardItem;
