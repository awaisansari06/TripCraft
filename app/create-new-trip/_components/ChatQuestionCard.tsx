"use client";

import { useId, type ReactNode } from 'react';
import { Check } from 'lucide-react';

export default function ChatQuestionCard({ title, description, children, busy = false }: {
    title: string; description?: string; children: ReactNode; busy?: boolean;
}) {
    const id = useId();
    return <section className="chat-question" aria-labelledby={id} aria-busy={busy}>
        <header className="chat-question-heading">
            <h3 id={id}>{title}</h3>
            {description && <p>{description}</p>}
        </header>
        {children}
    </section>;
}

export interface ChatOption {
    value: string; title: string; description: string; icon: ReactNode;
}
export function ChatOptionGrid({ options, selected, onSelect, disabled = false }: {
    options: ChatOption[]; selected?: string; onSelect: (value: string) => void; disabled?: boolean;
}) {
    return <div className="chat-options">
        {options.map(option => <button key={option.value} type="button" className="chat-option"
            aria-pressed={selected === option.value} disabled={disabled} onClick={() => onSelect(option.value)}>
            <span className="chat-option-icon" aria-hidden="true">{option.icon}</span>
            <span className="chat-option-copy"><strong>{option.title}</strong><small>{option.description}</small></span>
            {selected === option.value && <Check className="chat-option-check" size={14} aria-hidden="true" />}
        </button>)}
    </div>;
}
