"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import './planner.css';
import ChatBoxWrapper from './_components/ChatBoxWrapper';
import { GripVertical, Map, Globe2, Download } from 'lucide-react';
import Itinerary from './_components/Itinerary';
import GlobalMap from './_components/GlobalMap';

const subscribeViewport = (callback: () => void) => {
    const media = window.matchMedia('(min-width: 1024px)');
    media.addEventListener('change', callback);
    return () => media.removeEventListener('change', callback);
};
function CreateNewTrip() {
    const desktop = useSyncExternalStore(subscribeViewport, () => window.matchMedia('(min-width: 1024px)').matches, () => null);
    const [leftPanelWidth, setLeftPanelWidth] = useState(35);
    const [isDragging, setIsDragging] = useState(false);
    const [viewMode, setViewMode] = useState<'itinerary' | 'map'>('itinerary');
    const [isTripReady, setIsTripReady] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Native Print Handler
    const handlePdfExport = () => {
        window.print();
    };

    const startResizing = () => {
        setIsDragging(true);
    };

    const stopResizing = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const resize = (e: MouseEvent) => {
            const bounds = containerRef.current?.getBoundingClientRect();
            if (!bounds) return;
            const minimum = Math.max(28, 320 / bounds.width * 100);
            setLeftPanelWidth(Math.min(50, Math.max(minimum, (e.clientX - bounds.left) / bounds.width * 100)));
        };
        if (isDragging) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isDragging]);

    if (desktop === null) return <div className="h-[calc(100dvh-var(--tc-nav-height))]" aria-label="Loading trip planner" />;
    return (
        <>
            {/* MOBILE LAYOUT (< 1024px) - Vertical Stack */}
            {!desktop && <div className='flex flex-col w-full min-h-screen bg-white dark:bg-black'>
                {/* Chat Section - Optimized Height */}
                <div className='w-full h-[55vh] min-h-[400px] border-b border-gray-200 dark:border-gray-800'>
                    <ChatBoxWrapper />
                </div>

                {/* Map Section - Fixed Height for Mobile */}
                <div className='w-full h-[300px] bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2'>
                    <GlobalMap />
                </div>

                {/* Itinerary Section - Scrollable, Full Width */}
                <div className='w-full flex-1 overflow-y-auto bg-white dark:bg-black px-2 py-4'>
                    <Itinerary />
                </div>
            </div>}

            {/* DESKTOP LAYOUT (>= 1024px) - Split Panel (UNCHANGED) */}
            {desktop && <div ref={containerRef} className='flex flex-row h-[calc(100dvh-var(--tc-nav-height))] w-full overflow-hidden'>
                {/* Left Panel - Chat */}
                <div
                    className='h-full bg-white dark:bg-black border-r relative z-10 shrink-0 w-[var(--left-width)]'
                    style={{ '--left-width': `${leftPanelWidth}%` } as React.CSSProperties}
                >
                    <div className="h-full w-full">
                        <ChatBoxWrapper />
                    </div>
                </div>

                {/* Resizer Handle */}
                <div
                    className='flex w-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-400/40 cursor-col-resize items-center justify-center group z-20 flex-shrink-0'
                    onMouseDown={startResizing}
                    role="separator"
                    aria-label="Resize chat panel"
                    aria-orientation="vertical"
                    aria-valuenow={Math.round(leftPanelWidth)}
                    tabIndex={0}
                    onKeyDown={event => {
                        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                        event.preventDefault();
                        const width = containerRef.current?.clientWidth ?? 1024;
                        setLeftPanelWidth(value => Math.max(Math.max(28, 320 / width * 100), Math.min(50, value + (event.key === 'ArrowRight' ? 2 : -2))));
                    }}
                >
                    <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>

                {/* Right Panel - Map or Itinerary */}
                <div ref={scrollContainerRef} className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden relative">
                    {/* View Toggle Button */}
                    <div className="absolute top-5 right-5 z-50 flex flex-col gap-4 items-end">
                        <button
                            onClick={() => setViewMode(viewMode === 'itinerary' ? 'map' : 'itinerary')}
                            className="bg-white dark:bg-black p-3 rounded-full shadow-lg border border-gray-100 dark:border-zinc-800 hover:scale-105 transition-all active:scale-95 text-primary group"
                            title="Toggle Map/List View"
                        >
                            {viewMode === 'itinerary' ? <Globe2 className="h-5 w-5 text-blue-600 animate-pulse group-hover:animate-none" /> : <Map className="h-5 w-5" />}
                        </button>

                        {/* Export PDF Button (Only when trip is ready) */}
                        {isTripReady && viewMode === 'itinerary' && (
                            <button
                                onClick={handlePdfExport}
                                className="bg-white dark:bg-black p-3 rounded-full shadow-lg border border-gray-100 dark:border-zinc-800 hover:scale-105 transition-all active:scale-95 text-primary group no-print"
                                title="Export Itinerary as PDF"
                            >
                                <Download className="h-5 w-5 text-purple-600 group-hover:text-purple-700" />
                            </button>
                        )}
                    </div>

                    {viewMode === 'itinerary' ? (
                        <Itinerary
                            scrollContainer={scrollContainerRef}
                            onTripReady={setIsTripReady}
                        />
                    ) : (
                        <div className="w-full h-full">
                            <GlobalMap />
                        </div>
                    )}
                </div>
            </div>}
        </>
    )
}

export default CreateNewTrip
