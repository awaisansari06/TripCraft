import { Sparkles, Edit2, LoaderCircle } from 'lucide-react';
import ChatQuestionCard from './ChatQuestionCard';

export interface GenerativeTripData {
    source?: string; destination?: string; tripDuration?: string | number;
    groupSize?: string; budget?: string; interests?: string; tripStyle?: string; travelPace?: string;
    [key: string]: unknown;
}
export function summaryValue(value: unknown): string {
    if (value === null || value === undefined || value === '' || value === 'N/A') return 'Not selected';
    return String(value);
}
export default function GenerativeTripUi({ tripData, onGenerate, onEdit, loading, disabled = false }: {
    tripData?: GenerativeTripData; onGenerate: () => void; onEdit: () => void; loading: boolean; disabled?: boolean;
}) {
    const fields: Array<[string, unknown]> = [
        ['Destination', tripData?.destination],
        ['Duration', tripData?.tripDuration ? tripData.tripDuration + ' days' : tripData?.duration],
        ['Travelers', tripData?.groupSize || tripData?.group_size],
        ['Budget', tripData?.budget],
    ];
    return <ChatQuestionCard title="Ready to plan?" description="Review your trip before we bring it to life." busy={loading}>
        <dl className="chat-trip-summary">
            {fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{summaryValue(value)}</dd></div>)}
        </dl>
        {tripData?.interests && <p className="chat-summary-interests"><strong>Interests</strong>{tripData.interests.split(',').map(value => value.trim()).filter(Boolean).join(' · ')}</p>}
        <div className="chat-generate-actions">
            <button type="button" className="planner-button-secondary" onClick={onEdit} disabled={loading || disabled}><Edit2 size={16} aria-hidden="true" />Edit</button>
            <button type="button" className="planner-button-primary" onClick={onGenerate} disabled={loading || disabled}>
                {loading ? <LoaderCircle size={16} className="planner-spinner" aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
                {loading ? 'Generating…' : 'Generate plan'}
            </button>
        </div>
        {loading && <p className="chat-generation-status" role="status">Building your itinerary. This can take a moment.</p>}
    </ChatQuestionCard>;
}
