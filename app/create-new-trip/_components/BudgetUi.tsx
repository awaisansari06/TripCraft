import { Wallet, PiggyBank, CircleDollarSign } from 'lucide-react';
import ChatQuestionCard, { ChatOptionGrid } from './ChatQuestionCard';

export const SelectBudgetOptions = [
    { id: 1, title: 'Budget-friendly', desc: 'Make the most of your budget', icon: Wallet, value: 'Low' },
    { id: 2, title: 'Comfort', desc: 'A balance of value and comfort', icon: PiggyBank, value: 'Medium' },
    { id: 3, title: 'Luxury', desc: 'A little extra indulgence', icon: CircleDollarSign, value: 'High' },
];
export default function BudgetUi({ onSelect, selected, disabled }: {
    onSelect: (value: string) => void; selected?: string; disabled?: boolean;
}) {
    return <ChatQuestionCard title="Your travel budget" description="Choose what feels comfortable.">
        <ChatOptionGrid selected={selected} disabled={disabled} onSelect={onSelect}
            options={SelectBudgetOptions.map(item => ({ value: item.value, title: item.title, description: item.desc, icon: <item.icon size={18} /> }))} />
    </ChatQuestionCard>;
}
