import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import Dashboard from '../../app/dashboard/page';
import { HomeHeader } from '../../app/_components/HomeHeader';
import SiteMotion from '../../app/_components/SiteMotion';
import { UserDetailContext } from '../../context/UserDetailContext';

// Browser-only UI fixtures. These transports never enter the production build.
const userDetail={_id:'ui-review',email:'ui-review@example.test',name:'UI review traveler'};
createRoot(document.getElementById('root')).render(
 <ThemeProvider attribute="class" defaultTheme={window.UI_REVIEW.theme} enableSystem={false}>
  <UserDetailContext.Provider value={{userDetail,setUserDetail:()=>{}}}>
   <HomeHeader /><SiteMotion><Dashboard /></SiteMotion>
  </UserDetailContext.Provider>
 </ThemeProvider>
);
