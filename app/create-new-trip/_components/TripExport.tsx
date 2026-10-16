"use client";

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Download, Printer, X, LoaderCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import TripPrintDocument from './TripPrintDocument';
import type { TripInfo } from './types';
import './trip-export.css';

const subscribe = () => () => {};
export default function TripExport({ trip }: { trip: TripInfo }) {
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);
    const [preparing, setPreparing] = useState(false);
    const [photosRequested, setPhotosRequested] = useState(false);
    const save = async () => {
        if (preparing) return;
        setPreparing(true);
        const title = document.title;
        try {
            await document.fonts.ready;
            await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>('.tc-trip-print-root img')).map(image =>
                new Promise<void>(resolve => {
                    if (image.complete) { resolve(); return; }
                    const finish = () => { clearTimeout(timer); image.removeEventListener('load', finish); image.removeEventListener('error', finish); resolve(); };
                    const timer = setTimeout(finish, 5000);
                    image.addEventListener('load', finish, { once: true }); image.addEventListener('error', finish, { once: true });
                })));
            document.title = 'TripCraft - ' + (trip.destination || 'Your trip').replace(/[<>:"/\\|?*]/g, '').slice(0, 100) + ' itinerary';
            window.print();
        } finally { document.title = title; setPreparing(false); }
    };
    return <>
        <Dialog.Root onOpenChange={open => { if (open) setPhotosRequested(true); }}>
            <Dialog.Trigger asChild><button type="button" className="planner-export-trigger no-print" aria-label="Export itinerary as PDF"><Download size={16} aria-hidden="true" /><span>Download</span></button></Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="trip-export-backdrop" />
                <Dialog.Content className="trip-export-dialog">
                    <div className="trip-export-toolbar">
                        <div><Dialog.Title>Your trip, ready to take along</Dialog.Title><Dialog.Description>A clean travel guide with your stays and daily plans.</Dialog.Description></div>
                        <button type="button" className="planner-button-primary" disabled={preparing} onClick={save}>{preparing ? <LoaderCircle size={16} className="planner-spinner" /> : <Printer size={16} />}<span>{preparing ? 'Preparing…' : 'Save as PDF'}</span></button>
                        <Dialog.Close asChild><button type="button" className="planner-icon-button" aria-label="Close export preview"><X size={19} /></button></Dialog.Close>
                    </div>
                    <p className="trip-export-hint">Choose “Save as PDF” in your browser’s print dialog. Use A4 for the intended layout.</p>
                    <div className="trip-export-preview"><TripPrintDocument trip={trip} /></div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
        {mounted && createPortal(<div className="tc-trip-print-root"><TripPrintDocument trip={trip} includePhotos={photosRequested} /></div>, document.body)}
    </>;
}
