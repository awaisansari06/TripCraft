"use client";

import Image from 'next/image';
import { useState } from 'react';
import type { TripInfo } from './types';
import { travelArtworkSrc, travelArtworkAlt } from '@/lib/travel-artwork';

function usablePhoto(value?: string) {
    if (!value || /example\.com|placeholder|unsplash\.com\/random/i.test(value)) return undefined;
    if (value.startsWith('/') && !value.startsWith('//')) return value;
    try { const url = new URL(value); return url.protocol === 'https:' ? value : undefined; } catch { return undefined; }
}
function TravelPhoto({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
    const [failed, setFailed] = useState(false);
    const photo = usablePhoto(src);
    if (!photo || failed) return null;
    return <div className={'te-photo ' + className}><Image src={photo} alt={alt} fill unoptimized={!photo.startsWith('/')} quality={75} loading="eager" sizes="700px" onError={() => setFailed(true)} /></div>;
}
function coverPhoto(destination: string) {
    const places: [RegExp, string][] = [
        [/paris|france/i, '05-paris'], [/new york/i, '06-new-york'], [/tokyo|japan/i, '07-tokyo'],
        [/rome/i, '08-rome'], [/dubai/i, '09-dubai'], [/agra/i, '10-agra'],
        [/amalfi|positano/i, '01-amalfi-hero'], [/naples/i, '11-naples-itinerary'], [/capri/i, '12-capri-itinerary'], [/goa/i, '02-beach-weekend'],
    ];
    const match = places.find(([pattern]) => pattern.test(destination));
    return match ? { src: travelArtworkSrc(match[1]), alt: travelArtworkAlt(match[1]) } : undefined;
}
export default function TripPrintDocument({ trip, includePhotos = true }: { trip: TripInfo; includePhotos?: boolean }) {
    const hotels = trip.hotels || [];
    const days = trip.itinerary || [];
    const cover = coverPhoto(trip.destination || '');
    return <article className="trip-export-document" aria-label="Printable trip itinerary">
        <section className="te-cover">
            <div className="te-brand"><Image src="/brand/tripcraft-symbol.png" width={30} height={30} alt="" unoptimized /><strong>TripCraft</strong><span>Your personal travel guide</span></div>
            <div className="te-cover-heading"><p className="te-eyebrow">A new chapter, thoughtfully planned</p><h1>{trip.destination || 'Your next adventure'}</h1><p className="te-origin">{trip.origin ? 'From ' + trip.origin : 'Your trip, at a glance'}</p></div>
            {includePhotos && cover && <TravelPhoto src={cover.src} alt={cover.alt} className="te-cover-photo" />}
            <dl className="te-facts">
                <div><dt>Duration</dt><dd>{trip.duration || 'Not specified'}</dd></div>
                <div><dt>Travelers</dt><dd>{trip.group_size || 'Not specified'}</dd></div>
                <div><dt>Budget</dt><dd>{trip.budget || 'Not specified'}</dd></div>
                <div><dt>In this guide</dt><dd>{days.length} {days.length === 1 ? 'day' : 'days'} of discovery</dd></div>
            </dl>
            {days.length > 0 && <div className="te-overview"><h2>The journey ahead</h2><ol>{days.slice(0, 6).map((day, index) => <li key={index}><span>Day {day.day || index + 1}</span><p>{day.day_plan || 'Discover your destination'}</p></li>)}</ol>{days.length > 6 && <p className="te-more-days">And {days.length - 6} more days in your day-by-day guide.</p>}</div>}
            <p className="te-cover-note">A place for your plans. Room for a little spontaneity.</p>
        </section>
        {hotels.length > 0 && <section className="te-hotels">
            <div className="te-section-heading"><p className="te-eyebrow">Rest, recharge, repeat</p><h2>Places to stay</h2><p>Your hotel recommendations, together in one place.</p></div>
            <div className="te-hotel-grid">{hotels.map((hotel, index) => <article className="te-hotel" key={hotel.hotel_name + index}>
                {includePhotos && <TravelPhoto src={hotel.hotel_image_url} alt={hotel.hotel_name || 'Recommended hotel'} />}
                <div className="te-hotel-body"><h3>{hotel.hotel_name}</h3>{hotel.hotel_address && <p className="te-address">{hotel.hotel_address}</p>}
                    {hotel.description && <p>{hotel.description}</p>}
                    <dl className="te-hotel-facts">
                        {hotel.price_per_night && <div><dt>Per night</dt><dd>{hotel.price_per_night}</dd></div>}
                        {hotel.rating != null && <div><dt>Rating</dt><dd>{hotel.rating} / 5</dd></div>}
                    </dl>
                </div>
            </article>)}</div>
        </section>}
        {days.map((day, dayIndex) => <section className="te-day" key={dayIndex}>
            <div className="te-section-heading"><p className="te-eyebrow">Your day-by-day itinerary</p><h2>Day {day.day || dayIndex + 1}</h2>{day.day_plan && <p className="te-day-plan">{day.day_plan}</p>}
                {day.best_time_to_visit_day && <p className="te-day-best-time">Best time: {day.best_time_to_visit_day}</p>}</div>
            <div className="te-activities">{(day.activities || []).map((activity, index) => <article className="te-activity" key={activity.place_name + index}>
                <span className="te-activity-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="te-activity-body"><h3>{activity.place_name}</h3>
                    {activity.place_address && <p className="te-address">{activity.place_address}</p>}
                    {activity.place_details && <p>{activity.place_details}</p>}
                    <dl className="te-activity-facts">
                        {activity.best_time_to_visit && <div><dt>When to go</dt><dd>{activity.best_time_to_visit}</dd></div>}
                        {activity.ticket_pricing && <div><dt>Admission</dt><dd>{activity.ticket_pricing}</dd></div>}
                        {activity.time_travel_each_location && <div><dt>Travel time</dt><dd>{activity.time_travel_each_location}</dd></div>}
                    </dl>
                </div>
                {includePhotos && <TravelPhoto src={activity.place_image_url} alt={activity.place_name || 'Recommended place to visit'} />}
            </article>)}</div>
            {!day.activities?.length && <p className="te-empty-day">No activities have been added to this day yet.</p>}
        </section>)}
    </article>;
}
