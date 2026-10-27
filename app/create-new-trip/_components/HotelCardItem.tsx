import Image from "next/image";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, Star } from "lucide-react";
import type { Hotel } from "./types";

type Props = {
    hotel: Hotel;
    onSelect?: (image: string, images: string[]) => void;
};

function HotelCardItem({ hotel, onSelect }: Props) {
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);

    useEffect(() => {
        if (!hotel?.hotel_name) return;
        const controller = new AbortController();
        const getPhotos = async () => {
        try {
            const result = await axios.post("/api/google-place-detail", {
                placeName: hotel?.hotel_name,
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
    }, [hotel?.hotel_name]);

    const imageSrc =
        (photoUrls.length > 0 ? photoUrls[0] : null) ||
        (hotel?.hotel_image_url && !hotel.hotel_image_url.includes("example.com")
            ? hotel.hotel_image_url
            : "/mountains.jpg");

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`View details for ${hotel?.hotel_name}`}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect?.(imageSrc, photoUrls.length > 0 ? photoUrls : [imageSrc]); } }}
            onClick={() => onSelect?.(imageSrc, photoUrls.length > 0 ? photoUrls : [imageSrc])}
            className="tc-place-card group"
        >
            <div className="tc-place-card-image">
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
                    <h3 className="tc-place-card-title">{hotel?.hotel_name}</h3>
                    <p className="tc-place-location">
                        <MapPin size={13} aria-hidden="true" /> {hotel?.hotel_address}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-between items-center mt-2">
                    <p className="tc-place-price"> {hotel?.price_per_night}</p>
                    <p className="tc-place-rating"><Star size={14} aria-hidden="true" /> {hotel?.rating}</p>
                </div>
            </div>
        </div>
    );
}
export default HotelCardItem;
