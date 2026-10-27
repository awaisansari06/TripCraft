import React, { useContext, useSyncExternalStore } from 'react';
import { TripDetailContext } from '../../context/TripDetailContext';

const subscribe = callback => { window.addEventListener('fixture-route', callback); return () => window.removeEventListener('fixture-route', callback); };
const router = { replace: url => { history.replaceState({}, '', url); window.dispatchEvent(new Event('fixture-route')); }, push: url => { window.fixtureNavigation = url; } };
export const useRouter = () => router;
export function useSearchParams() { return new URLSearchParams(useSyncExternalStore(subscribe, () => location.search)); }
export const usePathname = () => '/create-new-trip';
export const useTripDetail = () => useContext(TripDetailContext);
export function useQuery(name, args) {
    if (args === 'skip') return undefined;
    const path = String(name[Symbol.for('functionName')] || '');
    if (path.includes('GetSavedPlace')) return window.PLANNER_FIXTURE.savedPlace || null;
    if (path.includes('GetTrip') && !path.includes('GetMessages')) return window.PLANNER_FIXTURE.legacyTrip || null;
    return path.includes('GetMessages') ? window.PLANNER_FIXTURE.messages : null;
}
const mutations = new Map();
export function useMutation(name) {
    if (!mutations.has(name)) mutations.set(name, async args => {
        const operation = String(name[Symbol.for('functionName')] || '');
        window.fixtureMutations.push({ ...args, operation });
        if (window.fixtureFailSave && operation.includes('CreateTripDetail')) throw new Error('Fixture save failure');
        if (window.fixtureFailDelete && operation.includes('DeleteTrip')) throw new Error('Fixture delete failure');
        return 'fixture-id';
    });
    return mutations.get(name);
}
export const useUser = () => ({ isLoaded: true, user: { id: 'fixture-user' } });
export function SignedIn({ children }) { return children; }
export function SignedOut() { return null; }
export function UserButton() { return <button type="button" aria-label="Your account" style={{ width:32,height:32,borderRadius:'50%',background:'#0785be',color:'white' }}>S</button>; }
export function SignOutButton({ children }) { return children; }
export function Link({ href, children, ...props }) { return <a href={href} {...props}>{children}</a>; }
export function Image({ fill, priority, loading, ...props }) { return <img {...props} loading={loading} style={fill ? {position:'absolute',inset:0,width:'100%',height:'100%',...props.style} : props.style} />; }

