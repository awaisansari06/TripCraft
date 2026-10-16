import { User, Users, Home, PartyPopper } from 'lucide-react';
import ChatQuestionCard, { ChatOptionGrid } from './ChatQuestionCard';

export const SelectTravelesList = [
    { id: 1, title: 'Just me', desc: 'A solo adventure', icon: User, value: 'Solo' },
    { id: 2, title: 'A couple', desc: 'Time away for two', icon: Users, value: 'Couple' },
    { id: 3, title: 'Family', desc: 'Memories together', icon: Home, value: 'Family' },
    { id: 4, title: 'Friends', desc: 'Explore with your crew', icon: PartyPopper, value: 'Friends' },
];
export default function GroupSizeUi({ onSelect, selected, disabled }: {
    onSelect: (value: string) => void; selected?: string; disabled?: boolean;
}) {
    return <ChatQuestionCard title="Who’s coming along?" description="Choose your travel group.">
        <ChatOptionGrid selected={selected} disabled={disabled} onSelect={onSelect}
            options={SelectTravelesList.map(item => ({ value: item.value, title: item.title, description: item.desc, icon: <item.icon size={18} /> }))} />
    </ChatQuestionCard>;
}
