"use client";

import React, { useState, useEffect } from 'react';
import { Timeline } from '@/components/ui/timeline';
import HotelCardItem from './HotelCardItem';
import PlaceCardItem from './PlaceCardItem';
import { useTripDetail } from '@/app/provider';
import { ModalItem, Hotel, Activity } from './types';
import TripItemModal from './TripItemModal';
import GlobalMap from './GlobalMap';


function Itinerary({
    scrollContainer,
    onTripReady
}: {
    scrollContainer?: React.RefObject<HTMLDivElement | null>;
    onTripReady?: (isReady: boolean) => void;
}) {
    const { tripDetailInfo: tripData } = useTripDetail();
    const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);

    useEffect(() => {
        onTripReady?.(!!tripData);
    }, [tripData, onTripReady]);

    const handleHotelSelect = (hotel: Hotel, imageUrl: string, images: string[]) => {
        setSelectedItem({
            type: 'hotel',
            title: hotel.hotel_name,
            subtitle: hotel.hotel_address,
            description: hotel.description,
            imageUrl: imageUrl,
            images: images && images.length > 0 ? images : [imageUrl],
            context: "Recommended Hotel",
            price: hotel.price_per_night,
            rating: hotel.rating,
            geoCoordinates: hotel.geo_coordinates,
            countryName: tripData?.destination
        });
    };

    const handleActivitySelect = (activity: Activity & { rating?: number }, imageUrl: string, images: string[], context: string) => {
        setSelectedItem({
            type: 'activity',
            title: activity.place_name,
            subtitle: activity.place_address || activity.place_details,
            description: activity.place_details,
            imageUrl: imageUrl,
            images: images && images.length > 0 ? images : [imageUrl],
            context: context,
            price: activity.ticket_pricing,
            rating: activity.rating ?? "Not rated",
            duration: activity.time_travel_each_location,
            bestTime: activity.best_time_to_visit,
            geoCoordinates: typeof activity.geo_coordinates === 'string'
                ? { lat: 0, lng: 0 }
                : activity.geo_coordinates,
            countryName: tripData?.destination
        });
    };

    const data = tripData ? [
        {
            title: 'Hotels',
            content: (
                <div className='trip-card-grid'>
                    {tripData.hotels.map((hotel, index) => (
                        <HotelCardItem
                            key={index}
                            hotel={hotel}
                            onSelect={(imageUrl, images) => handleHotelSelect(hotel, imageUrl, images)}
                        />
                    ))}
                </div>
            ),
        },
        ...tripData?.itinerary.map((dayData) => ({
            title: `Day ${dayData?.day}`,
            content: (
                <div className='trip-card-grid'>
                    {dayData.activities.map((activity, index) => (
                        <PlaceCardItem
                            key={index}
                            activity={activity}
                            onSelect={(imageUrl, images) => handleActivitySelect(activity, imageUrl, images, `Day ${dayData.day}`)}
                        />
                    ))}
                </div>
            ),
        }))
    ] : [];

    // Extract valid days for the sidebar
    const tripDays = tripData ? tripData.itinerary.map((d) => d.day) : [];

    return (
        <div className={`trip-itinerary relative ${!tripData ? 'h-full overflow-hidden' : ''}`}>
            {tripData ? (
                <>
                    <nav className="trip-day-nav" aria-label="Itinerary days">
                        <strong>Days</strong>
                        {tripDays.map(day => (
                            <button key={day} onClick={(event) => {
                                const root = event.currentTarget.closest('.trip-itinerary');
                                const entry = root?.querySelector<HTMLElement>(`[id="day-${day}"]`);
                                if (!entry) return;
                                const scroller = scrollContainer?.current;
                                const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
                                if (scroller) scroller.scrollTo({ top: scroller.scrollTop + entry.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 70, behavior });
                                else entry.scrollIntoView({ behavior, block: 'start' });
                            }}>Day {day}</button>
                        ))}
                    </nav>
                    <Timeline data={data} scrollContainer={scrollContainer} tripData={tripData} />

                    <TripItemModal
                        isOpen={!!selectedItem}
                        onClose={() => setSelectedItem(null)}
                        item={selectedItem}
                    />
                </>
            ) : (
                <div className="w-full h-full p-4 md:px-10 md:pb-10 md:pt-14 overflow-hidden">
                    {!tripData ? (
                        <div className="flex flex-col gap-8 h-full">
                            {/* Global 3D Map (Fills remaining space) */}
                            <div className="flex-1 w-full min-h-0">
                                <GlobalMap />
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default Itinerary;
