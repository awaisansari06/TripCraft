"use client";

import { Suspense, useSyncExternalStore } from 'react';
import { SignIn, SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import TravelArtwork from '@/components/TravelArtwork';
import Link from 'next/link';
import { ArrowUpRight, Bookmark, MapPinned, Route } from 'lucide-react';
import './auth.css';

const subscribeOrigin = () => () => {};
function safeReturnPath(value: string | null, origin: string) {
    if (!value || /[\\\u0000-\u001f]/.test(value)) return undefined;
    if (value.startsWith('/') && !value.startsWith('//')) return value;
    try {
        const url = new URL(value);
        return origin && url.origin === origin ? url.pathname + url.search + url.hash : undefined;
    } catch { return undefined; }
}

function AccountForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
    const params = useSearchParams();
    const redirect = params.get('redirect_url');
    const origin = useSyncExternalStore(subscribeOrigin, () => window.location.origin, () => '');
    // Keep the existing trip continuation when moving between account screens.
    const destination = safeReturnPath(redirect, origin);
    const query = destination ? '?redirect_url=' + encodeURIComponent(destination) : '';
    const appearance = {
        variables: {
            fontFamily: 'var(--font-outfit), sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
            colorPrimary: 'var(--tc-orange)',
            colorBackground: 'var(--card-background)',
            colorText: 'var(--tc-ink)',
            colorTextSecondary: 'var(--tc-muted)',
            colorInputBackground: 'var(--input-background)',
            colorInputText: 'var(--tc-ink)',
        },
        elements: {
            rootBox: 'tc-auth-clerk',
            cardBox: 'tc-auth-card-box',
            card: 'tc-auth-card',
            headerTitle: 'tc-auth-form-title',
            headerSubtitle: 'tc-auth-form-subtitle',
            formButtonPrimary: 'tc-auth-submit',
            footer: 'tc-auth-clerk-footer',
            footerAction: 'tc-auth-clerk-footer-action',
        },
    };
    return <>
        {mode === 'sign-in' ? <SignIn routing="path" path="/sign-in" signUpUrl={'/sign-up' + query} fallbackRedirectUrl={destination || '/dashboard'} appearance={appearance} />
            : <SignUp routing="path" path="/sign-up" signInUrl={'/sign-in' + query} fallbackRedirectUrl={destination || '/dashboard'} appearance={appearance} />}
        <div className="tc-auth-account-footer">
        <p className="tc-auth-switch">{mode === 'sign-in' ? 'New to TripCraft?' : 'Already have an account?'}{' '}
            <Link href={(mode === 'sign-in' ? '/sign-up' : '/sign-in') + query}>{mode === 'sign-in' ? 'Create an account' : 'Sign in'}<ArrowUpRight size={14} aria-hidden="true" /></Link>
        </p>
        <p className="tc-auth-legal"><Link href="/privacy-policy">Privacy</Link><span aria-hidden="true">·</span><Link href="/terms-of-service">Terms</Link></p>
        </div>
    </>;
}

export default function AuthScreen({ mode }: { mode: 'sign-in' | 'sign-up' }) {
    return <main className="tc-auth">
        <div className="tc-auth-layout">
            <section className="tc-auth-story" aria-label="Plan your next chapter with TripCraft">
                <span className="tc-auth-eyebrow">A little wonder. A well-planned journey.</span>
                <p className="tc-auth-story-title">{mode === 'sign-in' ? 'Your next chapter is waiting.' : 'Good trips start here.'}</p>
                <p className="tc-auth-story-copy">{mode === 'sign-in' ? 'Come back to your saved places, thoughtful itineraries, and the trips you’re still dreaming about.' : 'Turn a travel idea into a trip that feels like you. Save your plans and pick up wherever you left off.'}</p>
                <div className="tc-auth-photo">
                    <TravelArtwork asset="12-capri-itinerary" priority sizes="(max-width: 900px) 0px, 45vw" />
                    <span>Make room for your next adventure.</span>
                </div>
                <ul className="tc-auth-benefits">
                    <li><Route size={17} aria-hidden="true" />Itineraries built around you</li>
                    <li><MapPinned size={17} aria-hidden="true" />Places worth discovering</li>
                    <li><Bookmark size={17} aria-hidden="true" />Your plans, saved for later</li>
                </ul>
            </section>
            <section className="tc-auth-form-panel" aria-label={mode === 'sign-in' ? 'Sign in to TripCraft' : 'Create a TripCraft account'}>
                <Suspense fallback={<div className="tc-auth-loading" role="status">Loading your secure sign-in…</div>}>
                    <AccountForm mode={mode} />
                </Suspense>
            </section>
        </div>
    </main>;
}
