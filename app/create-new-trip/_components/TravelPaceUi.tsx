"use client";
import ChatQuestionCard, { ChatOptionGrid } from './ChatQuestionCard';

// Keep the three pace values supported by the existing questionnaire.
const PACES = [
    { value: 'relaxed', title: 'Relaxed', description: '2–3 places per day', icon: '🐢' },
    { value: 'moderate', title: 'Moderate', description: '4–5 places per day', icon: '🚶' },
    { value: 'packed', title: 'Packed', description: '6–8 places per day', icon: '🏃' },
];
export default function TravelPaceUi({ value, onSelect, disabled }: {
    value?: string; onSelect: (value: string) => void; disabled?: boolean;
}) {
    return <ChatQuestionCard title="Travel pace" description="How busy would you like each day to be?">
        <ChatOptionGrid options={PACES} selected={value} onSelect={onSelect} disabled={disabled} />
    </ChatQuestionCard>;
}
