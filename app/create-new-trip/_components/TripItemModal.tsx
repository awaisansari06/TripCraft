import React, { useState, useEffect, useContext, useId } from 'react';
import { GlassModal } from "@/components/GlassModal";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart, Share2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ModalItem } from './types';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserDetailContext } from '@/context/UserDetailContext';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    item: ModalItem | null;
};

function TripItemModal({ isOpen, onClose, item }: Props) {
    const { userDetail } = useContext(UserDetailContext);
    const [activeIndex, setActiveIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Notes & Favorites State
    const [note, setNote] = useState("");
    const [noteError, setNoteError] = useState('');
    const noteId = useId();

    // Convex Hooks
    const savePlace = useMutation(api.savedPlaces.SavePlace);
    const removePlace = useMutation(api.savedPlaces.RemovePlace);
    const updateNote = useMutation(api.savedPlaces.UpdateNote);

    // Check if saved
    const savedPlace = useQuery(api.savedPlaces.GetSavedPlace,
        (userDetail && item) ? { userId: userDetail.email, placeName: item.title } : "skip"
    );

    // Sync note state when savedPlace loads
    useEffect(() => {
        if (savedPlace) {
            setNote(savedPlace.notes || "");
        } else if (!savedPlace) {
            setNote(""); // Reset if not saved
        }
    }, [savedPlace]);

    // Auto-save Note Logic (Debounced)
    useEffect(() => {
        if (savedPlace === undefined || !isOpen) return;
        const timer = setTimeout(async () => {
            // Only save if logged in, item exists, and note is different from DB
            if (userDetail && item && note !== (savedPlace?.notes || "")) {

                // If note empty and not saved, do nothing. 
                // If note has text:
                if (note.trim() || savedPlace) {
                    if (!savedPlace) {
                        // First save the place, then the note
                        try { await savePlace({
                            userId: userDetail.email,
                            placeName: item.title,
                            placeType: item.type,
                            metadata: item,
                            note,
                        }); setNoteError(''); } catch { setNoteError('Your note could not be saved. Please edit it to try again.'); }
                    } else {
                        // Update existing note
                        try { await updateNote({ userId: userDetail.email, placeName: item.title, note }); setNoteError(''); }
                        catch { setNoteError('Your note could not be saved. Please edit it to try again.'); }
                    }
                }
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [note, userDetail, item, savedPlace, savePlace, updateNote, isOpen]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!userDetail || !item) {
            alert("Please login to save places.");
            return;
        }

        if (savedPlace) {
            await removePlace({ userId: userDetail.email, placeName: item.title });
            setNote("");
        } else {
            await savePlace({
                userId: userDetail.email,
                placeName: item.title,
                placeType: item.type,
                metadata: item
            });
        }
    };

    // Reset index when item opens/changes
    useEffect(() => {
        setActiveIndex(0);
    }, [item]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, activeIndex]);

    if (!item) return null;

    const handleNext = () => {
        if (!item.images || item.images.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % item.images!.length);
    };

    const handlePrev = () => {
        if (!item.images || item.images.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + item.images!.length) % item.images!.length);
    };

    // Touch Handlers for Swipe
    const minSwipeDistance = 50;
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };
    const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        if (isLeftSwipe) handleNext();
        if (isRightSwipe) handlePrev();
    };

    return (
        <GlassModal
            isOpen={isOpen}
            onClose={onClose}
            className="sm:max-w-2xl bg-white/95 dark:bg-zinc-950/95"
        >
            <div className="flex flex-col max-h-[85vh] h-full bg-white dark:bg-zinc-950">

                {/* 1. Header / Image Carousel (Fixed Height) */}
                <div
                    className="relative w-full h-[220px] md:h-[300px] shrink-0 bg-gray-100 dark:bg-zinc-900 overflow-hidden group"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Carousel Container */}
                    <div className="w-full h-full relative">
                        <div className="absolute inset-0 transition-opacity duration-500 ease-in-out">
                            <Image
                                src={item.images && item.images.length > 0 ? item.images[activeIndex] : item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                priority
                            />
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {item.images && item.images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100 z-20"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100 z-20"
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Image Indicators */}
                    {item.images && item.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {item.images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                                    className={`h-1.5 rounded-full shadow-sm transition-all focus:outline-none ${i === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'}`}
                                    aria-label={`Go to image ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Top Overlay Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <div className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors cursor-pointer active:scale-95">
                            <Share2 className="h-4 w-4" />
                        </div>
                        <div
                            onClick={handleToggleSave}
                            className={`p-2 backdrop-blur-md rounded-full transition-colors cursor-pointer active:scale-95 ${savedPlace ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-black/20 text-white hover:bg-black/40'
                                }`}
                        >
                            <Heart className={`h-4 w-4 ${savedPlace ? 'fill-current' : ''}`} />
                        </div>
                        <div
                            onClick={onClose}
                            className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-colors cursor-pointer active:scale-95"
                            role="button"
                            aria-label="Close modal"
                        >
                            <X className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* 2. Scrollable Body Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                    {/* Title & Rating */}
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            {item.context && (
                                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                                    {item.context}
                                </p>
                            )}
                            <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-gray-100">
                                {item.title}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-primary" /> {item.subtitle}
                            </p>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full font-bold text-sm border border-yellow-100 dark:border-yellow-800 shadow-sm">
                                ⭐ {item.rating}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 font-medium">
                                Based on guest reviews
                            </span>
                        </div>
                    </div>

                    {/* Price & Primary Info Grid (Chips) */}
                    <div className="grid grid-cols-2 gap-3">

                        {item.type === 'hotel' ? (
                            <>
                                <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group/chip">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Price per night</p>
                                    <p className="text-lg font-bold text-primary group-hover/chip:scale-105 transition-transform origin-left">{item.price}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group/chip">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Rating Category</p>
                                    <p className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover/chip:scale-105 transition-transform origin-left">Excellent</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group/chip">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Entrance</p>
                                    <p className="text-lg font-bold text-primary group-hover/chip:scale-105 transition-transform origin-left">{item.price}</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group/chip">
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Duration</p>
                                    <p className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover/chip:scale-105 transition-transform origin-left">{item.duration || 'Flexible'}</p>
                                </div>
                                <div className="col-span-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                                    <p className="text-xs text-blue-500 dark:text-blue-400 font-medium uppercase tracking-wide mb-1">Best Time to Visit</p>
                                    <p className="text-base font-semibold text-blue-900 dark:text-blue-100">{item.bestTime}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About this experience</h3>
                        <p className="leading-relaxed">{item.description}</p>
                    </div>
                    {userDetail && <div className="space-y-2">
                        <label htmlFor={noteId} className="block text-sm font-medium">Your private notes</label>
                        <textarea id={noteId} rows={3} value={note} disabled={savedPlace === undefined}
                            onChange={event => setNote(event.target.value)} placeholder="What would you like to remember?"
                            className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--input-background)] p-3 text-base text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]" />
                        <p className="text-xs text-[var(--foreground-secondary)]">Notes save automatically. Adding a note saves this place.</p>
                        {noteError && <p role="alert" className="text-sm">{noteError}</p>}
                    </div>}
                </div>

                {/* 3. Sticky Footer Actions */}
                <div className="sticky bottom-0 p-4 border-t border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md flex flex-col gap-3 z-10 shrink-0">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 text-base rounded-xl border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 active:scale-95 transition-all duration-200"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        <Link
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.title},${item.subtitle}`)}`}
                            target="_blank"
                            className="flex-[2]"
                        >
                            <Button className="w-full h-12 text-base rounded-xl font-semibold shadow-lg shadow-blue-500/20 bg-linear-to-r from-primary to-blue-600 hover:to-primary transition-all duration-300 bg-size-[200%_auto] hover:bg-right">
                                <MapPin className="h-4 w-4 mr-2" /> View on Map
                            </Button>
                        </Link>
                    </div>

                    {/* Compare / Replace Option (New) */}
                    <button
                        className="w-full py-2 text-xs font-medium text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-1 group/replace"
                        onClick={() => {
                            // Placeholder for AI "Replace" logic
                            alert("AI Agent: Searching for alternatives... (Feature coming soon)");
                        }}
                    >
                        <span className="group-hover/replace:rotate-180 transition-transform duration-500">🔄</span> Replace this option
                    </button>
                </div>
            </div>
        </GlassModal>
    );
}

export default TripItemModal;
