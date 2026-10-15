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

    switch (uiType) {
        case 'groupSize':
            return <GroupSizeUi onSelect={onSelect as (v: string) => void} selected={typeof tripData?.groupSize === 'string' ? tripData.groupSize : undefined} disabled={disabled} />;

        case 'budget':
            return <BudgetUi onSelect={onSelect as (v: string) => void} selected={typeof tripData?.budget === 'string' ? tripData.budget : undefined} disabled={disabled} />;

        case 'tripDuration':
            return <TripDurationUi onSelect={onSelect as (v: number) => void} selected={typeof tripData?.tripDuration === 'number' ? tripData.tripDuration : undefined} disabled={disabled} />;

        case 'interests':
            return <InterestsUi onSelect={onSelect as (v: string[]) => void} selected={typeof tripData?.interests === 'string' ? tripData.interests.split(',') : []} />;

        case 'tripStyle':
            return <TripStyleUi onSelect={onSelect as (v: string) => void} value={typeof tripData?.tripStyle === 'string' ? tripData.tripStyle : undefined} />;

        case 'travelPace':
            return <TravelPaceUi onSelect={onSelect as (v: string) => void} value={typeof tripData?.travelPace === 'string' ? tripData.travelPace : undefined} />;

        case 'tripResult':
            return (
                <div className="space-y-4 w-full">
                    <h3 className="font-bold text-lg">Recommended Hotels</h3>
                    {tripData?.hotels?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tripData.hotels.map((hotel: Hotel, index: number) => (
                                <HotelCardItem key={index} hotel={hotel} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No hotels found in the plan.</p>
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
                />
            );

        default:
            return null;
    }
}

export default UiRenderer;
