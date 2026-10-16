"use client";
import { useState } from 'react';
import { Check } from 'lucide-react';
import ChatQuestionCard from './ChatQuestionCard';

const INTERESTS = [
    { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
    { id: 'sightseeing', label: 'Sightseeing', emoji: '🏛️' },
    { id: 'culture', label: 'Culture', emoji: '🎭' },
    { id: 'food', label: 'Food', emoji: '🍜' },
    { id: 'nightlife', label: 'Nightlife', emoji: '🌃' },
    { id: 'relaxation', label: 'Relaxation', emoji: '🧘' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'beaches', label: 'Beaches', emoji: '🏖️' },
    { id: 'nature', label: 'Nature', emoji: '🌿' },
    { id: 'mountains', label: 'Mountains', emoji: '⛰️' },
];
export default function InterestsUi({ selected = [], onSelect, disabled = false }: {
    selected?: string[]; onSelect: (values: string[]) => void; disabled?: boolean;
}) {
    const selectionKey = selected.map(value => value.trim()).filter(Boolean).join(',');
    const [localSelected, setLocalSelected] = useState(() => selectionKey ? selectionKey.split(',') : []);
    const [previousKey, setPreviousKey] = useState(selectionKey);
    // Reconcile a loaded/edited answer without resetting a local selection on every render.
    if (previousKey !== selectionKey) {
        setPreviousKey(selectionKey);
        setLocalSelected(selectionKey ? selectionKey.split(',') : []);
    }
    return <ChatQuestionCard title="Choose interests" description="Pick one or more things you love.">
        <div className="chat-interest-chips">
            {INTERESTS.map(item => {
                const active = localSelected.includes(item.id);
                return <button key={item.id} type="button" aria-pressed={active} disabled={disabled}
                    className="chat-interest-chip" onClick={() => setLocalSelected(previous => active ? previous.filter(value => value !== item.id) : [...previous, item.id])}>
                    <span aria-hidden="true">{item.emoji}</span><span>{item.label}</span>
                    <Check size={13} aria-hidden="true" className={active ? 'chip-check' : 'chip-check chip-check-hidden'} />
                </button>;
            })}
        </div>
        <div className="chat-question-actions">
            <button type="button" className="planner-button-secondary" disabled={disabled || !localSelected.length} onClick={() => setLocalSelected([])}>Clear</button>
            <span className="chat-selection-count" aria-live="polite">{localSelected.length} selected</span>
            <button type="button" className="planner-button-primary" disabled={disabled || !localSelected.length} onClick={() => onSelect(localSelected)}>Continue</button>
        </div>
    </ChatQuestionCard>;
}
