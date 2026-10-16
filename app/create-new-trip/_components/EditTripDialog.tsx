"use client";

import { useId, useState } from 'react';
import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface EditTripFormData {
    source?: string; destination?: string; groupSize?: string; budget?: string; tripDuration?: string | number;
    [key: string]: unknown;
}
export default function EditTripDialog({ open, onClose, currentData, onSave }: {
    open: boolean; onClose: () => void; currentData: EditTripFormData; onSave: (data: EditTripFormData) => void;
}) {
    const id = useId();
    const [formData, setFormData] = useState<EditTripFormData>(currentData || {});
    const update = (name: string, value: string) => setFormData(previous => ({ ...previous, [name]: value }));
    return <Dialog.Root open={open} onOpenChange={value => { if (!value) onClose(); }}>
        <Dialog.Portal>
            <Dialog.Overlay className="planner-editor-backdrop" />
            <Dialog.Content className="planner-editor">
                <Dialog.Title>Edit your trip</Dialog.Title>
                <Dialog.Description>Fine-tune the details before generating your itinerary.</Dialog.Description>
                <Dialog.Close asChild><button type="button" className="planner-icon-button planner-editor-close" aria-label="Close trip editor"><X size={19} /></button></Dialog.Close>
                <form onSubmit={event => { event.preventDefault(); onSave(formData); onClose(); }}>
                    <div className="planner-editor-fields">
                        {(['source', 'destination'] as const).map(name => <div key={name}>
                            <label htmlFor={id + name}>{name === 'source' ? 'Starting from' : 'Destination'}</label>
                            <input id={id + name} name={name} value={formData[name] || ''} onChange={event => update(name, event.target.value)} placeholder={name === 'source' ? 'e.g. Mumbai' : 'e.g. Japan'} />
                        </div>)}
                        <div>
                            <label htmlFor={id + 'group'}>Travelers</label>
                            <select id={id + 'group'} name="groupSize" value={formData.groupSize || ''} onChange={event => update('groupSize', event.target.value)}>
                                <option value="" disabled>Choose travelers</option>
                                <option value="Solo">Solo traveler</option><option value="Couple">Couple</option><option value="Family">Family</option><option value="Friends">Friends</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor={id + 'budget'}>Budget</label>
                            <select id={id + 'budget'} name="budget" value={formData.budget || ''} onChange={event => update('budget', event.target.value)}>
                                <option value="" disabled>Choose budget</option>
                                <option value="Low">Budget-friendly</option><option value="Medium">Comfort</option><option value="High">Luxury</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor={id + 'duration'}>Duration in days</label>
                            <input id={id + 'duration'} type="number" name="tripDuration" min={1} max={30} step={1} value={formData.tripDuration || ''} onChange={event => update('tripDuration', event.target.value)} placeholder="e.g. 5" />
                        </div>
                    </div>
                    <div className="planner-editor-actions">
                        <Dialog.Close asChild><button type="button" className="planner-button-secondary">Cancel</button></Dialog.Close>
                        <button type="submit" className="planner-button-primary">Save changes</button>
                    </div>
                </form>
            </Dialog.Content>
        </Dialog.Portal>
    </Dialog.Root>;
}
