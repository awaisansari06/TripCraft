import { Fragment, type ReactNode } from 'react';

// Deliberately render a small markdown subset as React text, never raw HTML.
function inline(text: string): ReactNode[] {
    return text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\n]+\*)/g).map((part, index) => {
        if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
        if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
        return <Fragment key={index}>{part}</Fragment>;
    });
}
export function formatAnswer(content: string, question?: string) {
    if (question !== 'interests') return content;
    return content.split(',').map(value => value.trim()).filter(Boolean).map(value => value.charAt(0).toUpperCase() + value.slice(1)).join(' · ');
}
export default function MessageContent({ content, answerType }: { content: string; answerType?: string }) {
    if (answerType === 'interests') return <div className="chat-answer"><strong>Your interests</strong><p>{formatAnswer(content, answerType)}</p></div>;
    const lines = content.split('\n');
    const blocks: ReactNode[] = [];
    for (let i = 0; i < lines.length;) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }
        const list = /^\s*(?:[-*+] |\d+\. )/.test(line);
        if (list) {
            const ordered = /^\s*\d+\. /.test(line);
            const items: ReactNode[] = [];
            const pattern = ordered ? /^\s*\d+\. / : /^\s*[-*+] /;
            while (i < lines.length && pattern.test(lines[i])) {
                items.push(<li key={i}>{inline(lines[i].replace(pattern, ''))}</li>);
                i++;
            }
            blocks.push(ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>);
        } else {
            const paragraph: string[] = [];
            while (i < lines.length && lines[i].trim() && !/^\s*(?:[-*+] |\d+\. )/.test(lines[i])) paragraph.push(lines[i++].replace(/^#{1,6}\s+/, ''));
            blocks.push(<p key={i}>{paragraph.map((text, index) => <Fragment key={index}>{index > 0 && <br />}{inline(text)}</Fragment>)}</p>);
        }
    }
    return <div className="chat-rich-text">{blocks}</div>;
}
