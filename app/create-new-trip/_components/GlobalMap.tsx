"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useTripDetail } from "@/app/provider";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";
import dynamic from 'next/dynamic';

const Geocoder = dynamic(
    () => import('@mapbox/search-js-react').then((mod) => mod.Geocoder),
    { ssr: false }
);

export default function GlobalMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const isUserInteracting = useRef(false);
    const [errorMsg] = useState(!MAPBOX_TOKEN ? "Missing Mapbox API Key" : "");
    const { tripDetailInfo } = useTripDetail();
    const [filter, setFilter] = useState<'all' | 'hotel' | 'activity'>('all');

    /* -----------------------------
       Initialize Map (Imperative)
    ------------------------------ */
    useEffect(() => {
        if (!mapContainer.current || mapRef.current || !MAPBOX_TOKEN) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            projection: { name: "globe" } as unknown as mapboxgl.ProjectionSpecification,
            center: [20, 15],
            zoom: 1.5,
            pitch: 0,
            attributionControl: false,
        });

        mapRef.current = map;

        map.on("load", () => {
            map.resize();
            map.setFog({
                color: "rgb(186,210,235)",
                "high-color": "rgb(36,92,223)",
                "horizon-blend": 0.04,
                "space-color": "rgb(11,11,25)",
                "star-intensity": 0.6,
            });

            /* 🗺️ GeoJSON Source */
            map.addSource("trip-points", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] },
            });

            /* 🔵 Dots Layer */
            map.addLayer({
                id: "trip-points-circle",
                type: "circle",
                source: "trip-points",
                paint: {
                    "circle-radius": 8,
                    "circle-color": [
                        "match",
                        ["get", "type"],
                        "hotel", "#ef4444",
                        "activity", "#3b82f6",
                        "#cccccc",
                    ],
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff",
                },
            });

            /* 🏷️ Text Layer */
            map.addLayer({
                id: "trip-points-label",
                type: "symbol",
                source: "trip-points",
                layout: {
                    "text-field": ["get", "title"],
                    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                    "text-size": 12,
                    "text-anchor": "top",
                    "text-offset": [0, 1],
                    "text-allow-overlap": false,
                    "text-ignore-placement": false,
                },
                paint: {
                    "text-color": "#ffffff",
                    "text-halo-color": "rgba(0,0,0,0.8)",
                    "text-halo-width": 2,
                },
            });

            /* 🖱️ Interactions */
            map.on("click", "trip-points-circle", (e) => {
                const geom = e.features?.[0]?.geometry as GeoJSON.Point | undefined;
                const coordinates = (geom?.coordinates ? [...geom.coordinates] : [0, 0]) as [number, number];
                const description = e.features?.[0]?.properties?.title;
                const type = e.features?.[0]?.properties?.type;

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup({ offset: 10, closeButton: false })
                    .setLngLat(coordinates)
                    .setHTML(
                        `<div class="font-bold text-sm text-black mb-1">${description}</div>
             <div class="text-xs text-gray-500 capitalize">${type}</div>`
                    )
                    .addTo(map);
            });

            map.on("mouseenter", "trip-points-circle", () => {
                map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", "trip-points-circle", () => {
                map.getCanvas().style.cursor = "";
            });
        });

        const stopSpin = () => (isUserInteracting.current = true);
        map.on("mousedown", stopSpin);
        map.on("dragstart", stopSpin);
        map.on("wheel", stopSpin);
        map.on("touchstart", stopSpin);

        // Disable auto-rotation on mobile for better performance
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

        const spin = () => {
            if (!mapRef.current || isUserInteracting.current || isMobile) return;
            if (map.getZoom() > 4) return;
            const center = map.getCenter();
            center.lng -= 0.03;
            map.easeTo({ center, duration: 1000, easing: (n) => n });
        };

        const timer = isMobile ? null : setInterval(spin, 120);

        return () => {
            if (timer) clearInterval(timer);
            map.remove();
            mapRef.current = null;
        };
    }, []);

    /* -----------------------------
       Sync Data & Filter
    ------------------------------ */
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const features: GeoJSON.Feature[] = [];
        if (tripDetailInfo) {
            if (filter === 'all' || filter === 'hotel') {
                tripDetailInfo.hotels?.forEach((hotel) => {
                    const c = hotel.geo_coordinates;
                    if (c && typeof c !== "string" && c.lat) {
                        features.push({
                            type: "Feature",
                            geometry: { type: "Point", coordinates: [c.lng, c.lat] },
                            properties: { title: hotel.hotel_name, type: "hotel" },
                        });
                    }
                });
            }

            if (filter === 'all' || filter === 'activity') {
                tripDetailInfo.itinerary?.forEach((day) => {
                    day.activities?.forEach((act) => {
                        const c = act.geo_coordinates;
                        if (c && typeof c !== "string" && c.lat) {
                            features.push({
                                type: "Feature",
                                geometry: { type: "Point", coordinates: [c.lng, c.lat] },
                                properties: { title: act.place_name, type: "activity" },
                            });
                        }
                    });
                });
            }
        }

        const updateSource = () => {
            const source = map.getSource("trip-points") as mapboxgl.GeoJSONSource;
            if (source) {
                source.setData({ type: "FeatureCollection", features });

                // Auto-zoom to fit all filtered locations
                if (features.length > 0 && filter !== 'all') {
                    // Stop auto-rotation when zooming to specific filter
                    isUserInteracting.current = true;

                    // Calculate bounds from all features
                    const bounds = new mapboxgl.LngLatBounds();
                    features.forEach((feature) => {
                        if (feature.geometry.type === "Point") {
                            bounds.extend(feature.geometry.coordinates as [number, number]);
                        }
                    });

                    // Fit map to bounds with padding
                    map.fitBounds(bounds, {
                        padding: { top: 100, bottom: 100, left: 100, right: 100 },
                        maxZoom: 12,
                        duration: 1500
                    });
                }
            }
        };

        if (map.isStyleLoaded()) {
            updateSource();
        } else {
            map.once("style.load", updateSource);
        }
    }, [tripDetailInfo, filter]);

    /* -----------------------------
       Geocoder Handler
    ------------------------------ */
    const handleRetrieve = (res: { features?: Array<{ geometry: { coordinates: [number, number] } }> }) => {
        const feature = res.features?.[0];
        const map = mapRef.current;
        if (feature && map) {
            isUserInteracting.current = true;
            map.flyTo({
                center: feature.geometry.coordinates,
                zoom: 14
            });
        }
    };

    if (errorMsg) {
        return (
            <div className="flex items-center justify-center h-full text-red-400 bg-gray-900">
                <p>{errorMsg}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[250px] lg:min-h-[500px] rounded-2xl overflow-hidden bg-[#0b0b19] shadow-xl">
            {/* MAP CONTAINER */}
            <div
                ref={mapContainer}
                className="absolute inset-0 w-full h-full"
                style={{ width: "100%", height: "100%" }}
            />

            {/* OVERLAYS */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-3 pointer-events-none">

                {/* SEARCH BAR & CHIPS ROW */}
                <div className="flex flex-wrap items-start gap-3 pointer-events-auto">
                    {/* Geocoder Component - Hidden on Mobile */}
                    <div className="hidden lg:block w-full max-w-[300px] shadow-lg rounded-lg overflow-hidden border border-white/20">
                        <Geocoder
                            accessToken={MAPBOX_TOKEN}
                            options={{
                                language: 'en',
                            }}
                            onRetrieve={handleRetrieve as never}
                            theme={{
                                variables: {
                                    fontFamily: 'inherit',
                                    unit: '14px',
                                    padding: '0.5em',
                                    borderRadius: '8px',
                                    boxShadow: 'none'
                                }
                            }}
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex flex-wrap gap-2 pt-0 lg:pt-1.5">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-full text-xs font-bold shadow-md transition-all ${filter === 'all' ? 'bg-white text-black' : 'bg-black/50 text-white backdrop-blur-md hover:bg-black/70'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('hotel')}
                            className={`px-4 py-2 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1 ${filter === 'hotel' ? 'bg-red-500 text-white' : 'bg-black/50 text-white backdrop-blur-md hover:bg-black/70'}`}
                        >
                            🏨 Hotels
                        </button>
                        <button
                            onClick={() => setFilter('activity')}
                            className={`px-4 py-2 rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-1 ${filter === 'activity' ? 'bg-blue-500 text-white' : 'bg-black/50 text-white backdrop-blur-md hover:bg-black/70'}`}
                        >
                            📍 Activities
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
