"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useTripDetail } from "@/app/provider";
import { LoaderCircle } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";
import dynamic from 'next/dynamic';

const Geocoder = dynamic(
    () => import('@mapbox/search-js-react').then((mod) => mod.Geocoder),
    { ssr: false }
);

export default function GlobalMap({ active = true }: { active?: boolean }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const isUserInteracting = useRef(false);
    const [errorMsg, setErrorMsg] = useState(!MAPBOX_TOKEN ? "The map is not configured yet. You can keep planning in the chat." : "");
    const activeRef = useRef(active);
    const { tripDetailInfo } = useTripDetail();
    const [filter, setFilter] = useState<'all' | 'hotel' | 'activity'>('all');
    const [mapReady, setMapReady] = useState(false);

    /* -----------------------------
       Initialize Map (Imperative)
    ------------------------------ */
    useEffect(() => {
        if (!mapContainer.current || mapRef.current || !MAPBOX_TOKEN) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        let map: mapboxgl.Map;
        try {
        map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            projection: { name: "globe" } as unknown as mapboxgl.ProjectionSpecification,
            center: [20, 15],
            zoom: 1.5,
            pitch: 0,
            attributionControl: false,
        });
        } catch {
            queueMicrotask(() => setErrorMsg('The interactive map could not start. Check that WebGL is available in your browser. Your chat is still available.'));
            return;
        }

        mapRef.current = map;
        map.once('idle', () => setMapReady(true));
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
        const resizeObserver = new ResizeObserver(entries => {
            if (entries.some(entry => entry.contentRect.width > 0 && entry.contentRect.height > 0)) map.resize();
        });
        resizeObserver.observe(mapContainer.current);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

                const popup = document.createElement('div');
                const title = document.createElement('strong');
                title.textContent = String(description || 'Trip location');
                const category = document.createElement('p');
                category.textContent = String(type || '');
                popup.append(title, category);
                new mapboxgl.Popup({ offset: 10, closeButton: true, className: 'trip-map-popup' })
                    .setLngLat(coordinates)
                    .setDOMContent(popup)
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
            if (!mapRef.current || isUserInteracting.current || isMobile || reducedMotion.matches || !activeRef.current || document.hidden || !mapContainer.current?.clientWidth) return;
            if (map.getZoom() > 4) return;
            const center = map.getCenter();
            center.lng -= 0.03;
            map.easeTo({ center, duration: 1000, easing: (n) => n });
        };

        const timer = isMobile ? null : setInterval(spin, 1000);
        const stopMotion = () => { if (reducedMotion.matches) map.stop(); };
        reducedMotion.addEventListener('change', stopMotion);

        return () => {
            if (timer) clearInterval(timer);
            resizeObserver.disconnect();
            reducedMotion.removeEventListener('change', stopMotion);
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        activeRef.current = active;
        const frame = requestAnimationFrame(() => {
            if (active) mapRef.current?.resize();
            else mapRef.current?.stop();
        });
        return () => cancelAnimationFrame(frame);
    }, [active]);

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
                    if (c && typeof c !== "string" && Number.isFinite(c.lat) && Number.isFinite(c.lng)) {
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
                        if (c && typeof c !== "string" && Number.isFinite(c.lat) && Number.isFinite(c.lng)) {
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
                        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1000
                    });
                }
            }
        };

        if (map.getSource('trip-points')) {
            updateSource();
        } else {
            map.once("load", updateSource);
        }
        return () => { map.off('load', updateSource); };
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
                zoom: 14,
                duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1000,
            });
        }
    };

    if (errorMsg) {
        return (
            <div className="planner-map-error" role="status">
                <p>{errorMsg}</p>
            </div>
        );
    }

    return (
        <div className="planner-map" data-map-ready={mapReady}>
            {/* MAP CONTAINER */}
            <div
                ref={mapContainer}
                className="planner-map-canvas"
                style={{ width: "100%", height: "100%" }}
            />
            {!mapReady && <div className="planner-map-loading" role="status"><LoaderCircle size={16} className="planner-spinner" aria-hidden="true" />Loading the map…</div>}

            {/* OVERLAYS */}
            <div className="planner-map-overlay">

                {/* SEARCH BAR & CHIPS ROW */}
                <div className="planner-map-controls">
                    {/* Geocoder Component - Hidden on Mobile */}
                    <div className="planner-map-search" role="search" aria-label="Find a destination">
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
                    <div className="planner-map-filters" role="group" aria-label="Map locations">
                        <button
                            onClick={() => setFilter('all')}
                            aria-pressed={filter === 'all'}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('hotel')}
                            aria-pressed={filter === 'hotel'}
                        >
                            🏨 Hotels
                        </button>
                        <button
                            onClick={() => setFilter('activity')}
                            aria-pressed={filter === 'activity'}
                        >
                            📍 Activities
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
