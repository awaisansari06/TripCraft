"use client";
import ChatQuestionCard, { ChatOptionGrid } from './ChatQuestionCard';

const STYLES = [
    { value: 'relaxed', title: 'Relaxed', description: 'Take it easy', icon: '😌' },
    { value: 'balanced', title: 'Balanced', description: 'Sightseeing and rest', icon: '🎯' },
    { value: 'fast', title: 'Fast-paced', description: 'See as much as possible', icon: '⚡' },
    { value: 'culture', title: 'Culture-focused', description: 'History and art', icon: '🏛️' },
    { value: 'food', title: 'Food-focused', description: 'A culinary journey', icon: '🍜' },
    { value: 'leisure', title: 'Leisure', description: 'Beaches and spas', icon: '🏖️' },
];
export default function TripStyleUi({ value, onSelect, disabled }: {
    value?: string; onSelect: (value: string) => void; disabled?: boolean;
}) {
    return <ChatQuestionCard title="Travel vibe" description="What’s your travel mood?">
        <ChatOptionGrid options={STYLES} selected={value} onSelect={onSelect} disabled={disabled} />
    </ChatQuestionCard>;
}
