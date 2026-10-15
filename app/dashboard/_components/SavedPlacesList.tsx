"use client";

import React, { useContext, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserDetailContext } from '@/context/UserDetailContext';
import HotelCardItem from '@/app/create-new-trip/_components/HotelCardItem';
import PlaceCardItem from '@/app/create-new-trip/_components/PlaceCardItem';
import TripItemModal from '@/app/create-new-trip/_components/TripItemModal';
import { ModalItem } from '@/app/create-new-trip/_components/types';
import { Heart } from 'lucide-react';

function SavedPlacesList() {
    const { userDetail } = useContext(UserDetailContext);
    const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);

    // Fetch Saved Places
    const savedPlaces = useQuery(api.savedPlaces.GetSavedPlaces,
        userDetail ? { userId: userDetail.email } : "skip"
    );

    return (
        <section className="dashboard-section tc-surface dashboard-panel" aria-labelledby="dashboard-saved-title" data-reveal>
            <div className="dashboard-panel-heading">
                <div>
                    <span className="tc-eyebrow">Your shortlist</span>
                    <h2 id="dashboard-saved-title">Saved <em>places</em></h2>
                    <p>Favorites from your trips, ready when you are.</p>
                </div>
                {!!savedPlaces?.length && <span className="dashboard-stat">{savedPlaces.length} saved</span>}
            </div>

            {savedPlaces === undefined ? (
                <div className="dashboard-card-grid" role="status" aria-label="Loading saved places">
                    {[0, 1, 2].map((item) => <div className="dashboard-loading-card" key={item} />)}
                </div>
            ) : savedPlaces.length === 0 ? (
                <div className="dashboard-saved-empty">
                    <Heart size={25} strokeWidth={1.8} aria-hidden="true" />
                    <h3>No saved places yet</h3>
                    <p>Save a hotel or a place while planning a trip and you will find it here.</p>
                </div>
            ) : (
                <div className="dashboard-saved-grid dashboard-card-grid">
                    {savedPlaces.map((place) => {
                        // Map ModalItem (metadata) back to component-specific types to fix UI rendering
                        const hotelData = {
                            hotel_name: place.metadata.title,
                            hotel_address: place.metadata.subtitle,
                            price_per_night: place.metadata.price,
                            hotel_image_url: place.metadata.images?.[0] || place.metadata.imageUrl,
                            geo_coordinates: typeof place.metadata.geoCoordinates === 'object'
                                ? place.metadata.geoCoordinates
                                : { lat: 0, lng: 0 },
                            rating: Number(place.metadata.rating),
                            description: place.metadata.description
                        };

                        const activityData = {
                            place_name: place.metadata.title,
                            place_details: place.metadata.description,
                            place_image_url: place.metadata.images?.[0] || place.metadata.imageUrl,
                            place_address: place.metadata.subtitle,
                            ticket_pricing: place.metadata.price,
                            time_travel_each_location: place.metadata.duration || "N/A",
                            best_time_to_visit: place.metadata.bestTime || "N/A",
                            geo_coordinates: typeof place.metadata.geoCoordinates === 'object'
                                ? place.metadata.geoCoordinates
                                : { lat: 0, lng: 0 }
                        };

                        return (
                            <div key={place._id} className="relative group">
                                {/* Country/Context Badge */}
                                {place.metadata.countryName && (
                                    <div className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white px-3 py-1 text-[10px] font-bold rounded-full border border-white/20 shadow-lg uppercase tracking-wider">
                                        {place.metadata.countryName}
                                    </div>
                                )}

                                {place.placeType === 'hotel' ? (
                                    <HotelCardItem
                                        hotel={hotelData}
                                        onSelect={(imageUrl, images) =>
                                            setSelectedItem({
                                                ...place.metadata,
                                                imageUrl: imageUrl,
                                                images: images && images.length > 0 ? images : [imageUrl]
                                            })
                                        }
                                    />
                                ) : (
                                    <PlaceCardItem
                                        activity={activityData}
                                        onSelect={(imageUrl, images) =>
                                            setSelectedItem({
                                                ...place.metadata,
                                                imageUrl: imageUrl,
                                                images: images && images.length > 0 ? images : [imageUrl]
                                            })
                                        }
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <TripItemModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                item={selectedItem}
            />
        </section>
    );
}

export default SavedPlacesList;
