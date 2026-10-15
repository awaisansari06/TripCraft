"use client";

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

const emptySubscribe = () => () => {};

interface EditTripFormData {
    source?: string;
    destination?: string;
    groupSize?: string;
    budget?: string;
    tripDuration?: string | number;
    [key: string]: unknown;
}

interface EditTripDialogProps {
    open: boolean;
    onClose: () => void;
    currentData: EditTripFormData;
    onSave: (newData: EditTripFormData) => void;
}

function EditTripDialog({ open, onClose, currentData, onSave }: EditTripDialogProps) {
    const [formData, setFormData] = useState<EditTripFormData>(currentData || {});
    const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!open || !isMounted) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 scale-100 animate-in zoom-in-95 duration-200 relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    onClick={onClose}
                >
                    <X className="w-5 h-5" />
                </Button>

                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Edit Your Trip</h2>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Source</label>
                            <Input name="source" value={formData.source || ''} onChange={handleChange} placeholder="e.g. New York" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Destination</label>
                            <Input name="destination" value={formData.destination || ''} onChange={handleChange} placeholder="e.g. Paris" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Travelers</label>
                            <select
                                name="groupSize"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.groupSize || ''}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select group size</option>
                                <option value="Solo">Solo Traveler</option>
                                <option value="Couple">Couple</option>
                                <option value="Family">Family</option>
                                <option value="Friends">Friends</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Budget</label>
                            <select
                                name="budget"
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.budget || ''}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select budget</option>
                                <option value="Low">Cheap (Low)</option>
                                <option value="Medium">Moderate (Medium)</option>
                                <option value="High">Luxury (High)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Duration (Days)</label>
                        <Input type="number" name="tripDuration" value={formData.tripDuration || ''} onChange={handleChange} placeholder="e.g. 5" min={1} />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">Save Changes</Button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default EditTripDialog;
