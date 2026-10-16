"use client";

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './planner.css';
import { GripVertical, Map, MessageSquare, List } from 'lucide-react';
import ChatBoxWrapper from './_components/ChatBoxWrapper';
import Itinerary from './_components/Itinerary';
import GlobalMap from './_components/GlobalMap';
import TripExport from './_components/TripExport';
import { useTripDetail } from '@/app/provider';

export default function CreateNewTrip() {
    const { tripDetailInfo } = useTripDetail();
    const isTripReady = !!tripDetailInfo;
    const [panelWidth, setPanelWidth] = useState(420);
    const [isDragging, setIsDragging] = useState(false);
    const [mobileView, setMobileView] = useState<'chat' | 'explore'>('chat');
    const [viewMode, setViewMode] = useState<'itinerary' | 'map'>('itinerary');
    const containerRef = useRef<HTMLElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const showingMap = !isTripReady || viewMode === 'map';

    useEffect(() => {
        const viewport = window.visualViewport;
        const update = () => containerRef.current?.style.setProperty('--planner-viewport-height', (viewport?.height ?? window.innerHeight) + 'px');
        update();
        viewport?.addEventListener('resize', update);
        window.addEventListener('resize', update, { passive: true });
        return () => { viewport?.removeEventListener('resize', update); window.removeEventListener('resize', update); };
    }, []);

    const clampWidth = (width: number) => {
        const available = containerRef.current?.clientWidth ?? 1024;
        return Math.max(360, Math.min(Math.min(560, available * 0.5), width));
    };
    useEffect(() => {
        if (!isDragging) return;
        const resize = (event: PointerEvent) => {
            const bounds = containerRef.current?.getBoundingClientRect();
            if (bounds) setPanelWidth(Math.max(360, Math.min(Math.min(560, bounds.width * 0.5), event.clientX - bounds.left)));
        };
        const stop = () => setIsDragging(false);
        window.addEventListener('pointermove', resize);
        window.addEventListener('pointerup', stop, { once: true });
        window.addEventListener('pointercancel', stop, { once: true });
        return () => {
            window.removeEventListener('pointermove', resize);
            window.removeEventListener('pointerup', stop);
            window.removeEventListener('pointercancel', stop);
        };
    }, [isDragging]);

    const selectMobileView = (value: 'chat' | 'map' | 'itinerary') => {
        setMobileView(value === 'chat' ? 'chat' : 'explore');
        if (value !== 'chat') setViewMode(value);
    };
    return <main ref={containerRef} className="planner-shell" data-mobile-view={mobileView}
        data-resizing={isDragging} style={{ '--planner-panel-width': panelWidth + 'px' } as CSSProperties}>
        <nav className="planner-mobile-switch" aria-label="Planner views">
            <button type="button" aria-pressed={mobileView === 'chat'} onClick={() => selectMobileView('chat')} aria-controls="planner-chat"><MessageSquare size={16} />Chat</button>
            <button type="button" aria-pressed={mobileView === 'explore' && showingMap} onClick={() => selectMobileView('map')} aria-controls="planner-explore"><Map size={16} />Explore map</button>
            {isTripReady && <button type="button" aria-pressed={mobileView === 'explore' && !showingMap} onClick={() => selectMobileView('itinerary')} aria-controls="planner-explore"><List size={16} />Itinerary</button>}
        </nav>
        <section id="planner-chat" className="planner-chat-panel" aria-label="TripCraft AI assistant">
            <ChatBoxWrapper />
        </section>
        <div className="planner-resizer" role="separator" tabIndex={0} aria-label="Resize chat panel"
            aria-orientation="vertical" aria-valuenow={Math.round(panelWidth)} aria-valuemin={360}
            aria-valuemax={560} aria-valuetext={Math.round(panelWidth) + ' pixels'}
            onPointerDown={event => { if (event.button === 0) { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setIsDragging(true); } }}
            onKeyDown={event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                setPanelWidth(value => clampWidth(event.key === 'Home' ? 360 : event.key === 'End' ? 560 : value + (event.key === 'ArrowRight' ? 20 : -20)));
            }}><GripVertical size={14} aria-hidden="true" /></div>
        <section id="planner-explore" className="planner-explore-panel" aria-label="Explore your trip">
            <header className="planner-explore-toolbar">
                <div><span className="planner-explore-eyebrow">{isTripReady ? 'Your adventure' : 'A world of possibilities'}</span><h2>{showingMap ? 'Explore the map' : 'Your itinerary'}</h2></div>
                <div className="planner-explore-actions">
                    {isTripReady && <div className="planner-view-switch" role="group" aria-label="Explore views">
                        <button type="button" aria-pressed={showingMap} onClick={() => setViewMode('map')} aria-label="Show map"><Map size={16} /><span>Map</span></button>
                        <button type="button" aria-pressed={!showingMap} onClick={() => setViewMode('itinerary')} aria-label="Show itinerary"><List size={16} /><span>Itinerary</span></button>
                    </div>}
                    {tripDetailInfo && <TripExport trip={tripDetailInfo} />}
                </div>
            </header>
            <div className="planner-map-panel" hidden={!showingMap}><GlobalMap active={showingMap} /></div>
            <div className="planner-itinerary-panel" hidden={showingMap} ref={scrollContainerRef}>
                {isTripReady && <Itinerary scrollContainer={scrollContainerRef} />}
            </div>
        </section>
    </main>;
}
