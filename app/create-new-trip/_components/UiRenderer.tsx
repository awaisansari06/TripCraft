import React from 'react';
import GroupSizeUi from './GroupSizeUi';
import BudgetUi from './BudgetUi';
import TripDurationUi from './TripDurationUi';
import GenerativeTripUi from './GenerativeTripUi';
import InterestsUi from './InterestsUi';
import TripStyleUi from './TripStyleUi';
import TravelPaceUi from './TravelPaceUi';
import HotelCardItem from './HotelCardItem';
import type { Hotel } from './types';

export interface TripFormData {
    source?: string;
    destination?: string;
    groupSize?: string;
    budget?: string;
    tripDuration?: number | string;
    interests?: string;
    tripStyle?: string;
    travelPace?: string;
    locationInfo?: { name?: string };
    hotels?: Hotel[];
    [key: string]: unknown;
}

interface UiRendererProps {
    uiType: string;
    onSelect: (value: string | number | string[]) => void;
    tripData?: TripFormData;
    loading?: boolean;
    onGenerate?: () => void;
    onEdit?: () => void;
    disabled?: boolean;
}

function UiRenderer({ uiType, onSelect, tripData, loading, onGenerate, onEdit, disabled }: UiRendererProps) {
    const groupSize = tripData?.groupSize || tripData?.group_size;

    switch (uiType) {
        case 'groupSize':
            return <GroupSizeUi onSelect={onSelect as (v: string) => void} selected={typeof groupSize === 'string' ? groupSize : undefined} disabled={disabled || loading} />;

        case 'budget':
            return <BudgetUi onSelect={onSelect as (v: string) => void} selected={typeof tripData?.budget === 'string' ? tripData.budget : undefined} disabled={disabled || loading} />;

        case 'tripDuration':
            return <TripDurationUi onSelect={onSelect as (v: number) => void} selected={tripData?.tripDuration ? Number(tripData.tripDuration) : undefined} disabled={disabled || loading} />;

        case 'interests':
            return <InterestsUi onSelect={onSelect as (v: string[]) => void} selected={typeof tripData?.interests === 'string' ? tripData.interests.split(',') : []} disabled={disabled || loading} />;

        case 'tripStyle':
            return <TripStyleUi onSelect={onSelect as (v: string) => void} value={typeof tripData?.tripStyle === 'string' ? tripData.tripStyle : undefined} disabled={disabled || loading} />;

        case 'travelPace':
            return <TravelPaceUi onSelect={onSelect as (v: string) => void} value={typeof tripData?.travelPace === 'string' ? tripData.travelPace : undefined} disabled={disabled || loading} />;

        case 'tripResult':
            return (
                <div className="chat-result">
                    <h3>Recommended hotels</h3>
                    {tripData?.hotels?.length ? (
                        <div className="chat-result-hotels">
                            {tripData.hotels.map((hotel: Hotel, index: number) => (
                                <HotelCardItem key={index} hotel={hotel} />
                            ))}
                        </div>
                    ) : (
                        <p>No hotels found in the plan.</p>
                    )}
                </div>
            );

        case 'final':
            return (
                <GenerativeTripUi
                    tripData={tripData}
                    onGenerate={onGenerate!}
                    onEdit={onEdit!}
                    loading={loading || false}
                    disabled={disabled}
                />
            );

        default:
            return null;
    }
}

export default UiRenderer;
