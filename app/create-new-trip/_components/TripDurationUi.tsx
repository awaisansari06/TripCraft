"use client";
import { useId, useState } from 'react';
import ChatQuestionCard from './ChatQuestionCard';

const PRESET_DAYS = [1, 2, 3, 5, 7, 10, 14];
export default function TripDurationUi({ onSelect, selected, disabled }: {
    onSelect: (value: number) => void; selected?: number; disabled?: boolean;
}) {
    const id = useId();
    const [customDays, setCustomDays] = useState('');
    const valid = /^\d+$/.test(customDays) && Number(customDays) >= 1 && Number(customDays) <= 30;
    const submit = () => { if (valid && !disabled) onSelect(Number(customDays)); };
    return <ChatQuestionCard title="How long is your trip?" description="Choose a duration, or enter 1–30 days.">
        <div className="chat-duration-presets">
            {PRESET_DAYS.map(day => <button key={day} type="button" className="chat-duration-option" aria-pressed={selected === day} disabled={disabled}
                onClick={() => { setCustomDays(''); onSelect(day); }}>{day}<small>{day === 1 ? 'day' : 'days'}</small></button>)}
        </div>
        <div className="chat-duration-custom">
            <label htmlFor={id}>Custom days</label>
            <div>
                <input id={id} type="number" inputMode="numeric" min={1} max={30} step={1} placeholder="e.g. 6"
                    value={customDays} disabled={disabled} aria-describedby={id + '-hint'}
                    onChange={event => setCustomDays(event.target.value)} onKeyDown={event => {
                        if (event.key === 'Enter') { event.preventDefault(); submit(); }
                    }} />
                <button type="button" className="planner-button-primary" disabled={disabled || !valid} onClick={submit}>Continue</button>
            </div>
            <small id={id + '-hint'}>{customDays && !valid ? 'Enter a whole number from 1 to 30.' : 'Confirm when you’re ready.'}</small>
        </div>
    </ChatQuestionCard>;
}
