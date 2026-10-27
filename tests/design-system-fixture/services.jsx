import React from 'react';
export const usePathname=()=>'/dashboard';
export const useRouter=()=>({push:url=>{window.reviewNavigation=url;}});
export const useUser=()=>({isLoaded:true,user:{id:'ui-review'}});
export function SignedIn({children}){return children;}
export function SignedOut(){return null;}
export function UserButton(){return <button aria-label="Your account" style={{width:32,height:32,borderRadius:'50%',background:'var(--app-accent)',color:'var(--app-on-accent)'}}>A</button>;}
export function SignOutButton({children}){return children;}
export function useQuery(name,args){
 if(args==='skip'||window.UI_REVIEW.state==='loading')return undefined;
 const operation=String(name[Symbol.for('functionName')]||'');
 if(operation.endsWith('GetUserTrips'))return window.UI_REVIEW.state==='empty'?[]:window.UI_REVIEW.trips;
 if(operation.endsWith('GetSavedPlaces'))return window.UI_REVIEW.state==='empty'?[]:window.UI_REVIEW.places;
 return null;
}
const noop=async()=>null;
export const useMutation=()=>noop;
