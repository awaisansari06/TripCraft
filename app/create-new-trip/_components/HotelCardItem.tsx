import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Hotel } from "./types";

type Props = {
    hotel: Hotel;
    onSelect?: (image: string, images: string[]) => void;
};

function HotelCardItem({ hotel, onSelect }: Props) {
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);

    useEffect(() => {
        if (hotel?.hotel_name) GetGooglePlaceDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotel?.hotel_name]);

    const GetGooglePlaceDetail = async () => {
        try {
            const result = await axios.post("/api/google-place-detail", {
                placeName: hotel?.hotel_name,
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
        (hotel?.hotel_image_url && !hotel.hotel_image_url.includes("example.com")
            ? hotel.hotel_image_url
            : "/mountains.jpg");

    return (
        <div
            onClick={() => onSelect?.(imageSrc, photoUrls.length > 0 ? photoUrls : [imageSrc])}
            className="hover:scale-[1.02] transition-all cursor-pointer border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm bg-white dark:bg-zinc-900 overflow-hidden group"
        >
            <div className="relative h-[180px] w-full bg-gray-100 dark:bg-zinc-800">
                <Image
                    src={imageSrc}
                    alt={hotel?.hotel_name || "Hotel Image"}
                    fill
                    sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                    onError={() => setPhotoUrls(["/mountains.jpg"])}
                />
            </div>

            <div className="p-4 flex flex-col gap-2 min-h-[160px] justify-between">
                <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{hotel?.hotel_name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        📍 {hotel?.hotel_address}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-between items-center mt-2">
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">💵 {hotel?.price_per_night}</p>
                    <p className="text-sm font-bold text-amber-500 dark:text-amber-400">⭐ {hotel?.rating}</p>
                </div>
            </div>
        </div>
    );
}
export default HotelCardItem;
