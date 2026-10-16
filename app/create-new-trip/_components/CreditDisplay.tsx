"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import axios from 'axios';

export interface CreditInfo {
    isAuthenticated: boolean;
    isPremium: boolean;
    remaining: number;
    capacity: number;
    resetInfo: { resetAt: string; hoursUntilReset: number } | null;
}
export default function CreditDisplay({ latest }: { latest: CreditInfo | null }) {
    const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(latest);
    const [previousLatest, setPreviousLatest] = useState(latest);
    const [loading, setLoading] = useState(!latest);
    const [failed, setFailed] = useState(false);
    if (previousLatest !== latest) {
        setPreviousLatest(latest);
        if (latest) { setCreditInfo(latest); setLoading(false); setFailed(false); }
    }
    useEffect(() => {
        const controller = new AbortController();
        const fetchCreditInfo = async () => {
            try {
                const response = await axios.get('/api/credits', { signal: controller.signal });
                setCreditInfo(response.data);
                setFailed(false);
            } catch (error) {
                if (!axios.isCancel(error)) {
                    if (axios.isAxiosError(error) && error.response?.status === 401) {
                        setCreditInfo(null);
                        setFailed(false);
                    } else setFailed(true);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        void fetchCreditInfo();
        const interval = setInterval(fetchCreditInfo, 30000);
        return () => { controller.abort(); clearInterval(interval); };
    }, [latest]);
    if (failed) return <p role="status" className="chat-usage chat-usage-unavailable">Credit balance temporarily unavailable.</p>;
    if (loading) return <p role="status" className="chat-usage">Checking your credits…</p>;
    if (!creditInfo?.isAuthenticated) return null;
    return <div className="chat-usage" role="status" aria-atomic="true">
        <span><Sparkles size={14} aria-hidden="true" /><span><strong>{creditInfo.remaining}</strong> {creditInfo.isPremium ? 'credits available' : 'trips left'}</span></span>
        {creditInfo.isPremium ? <span className="chat-plan-label">Premium</span> : <Link href="/pricing">Upgrade <ArrowUpRight size={13} aria-hidden="true" /></Link>}
    </div>;
}
