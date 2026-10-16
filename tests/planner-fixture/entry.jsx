import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import Planner from '../../app/create-new-trip/page';
import { HomeHeader } from '../../app/_components/HomeHeader';
import { TripDetailContext } from '../../context/TripDetailContext';
import { UserDetailContext } from '../../context/UserDetailContext';

window.fixtureMutations = [];
function App() {
    const [tripDetailInfo, setTripDetailInfo] = useState(window.PLANNER_FIXTURE.trip || null);
    const [userDetail, setUserDetail] = useState({ _id:'fixture-user', name:'UI test traveler' });
    return <ThemeProvider attribute="class" defaultTheme={window.PLANNER_FIXTURE.theme} enableSystem>
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
            <TripDetailContext.Provider value={{ tripDetailInfo, setTripDetailInfo }}>
                <HomeHeader /><Planner />
            </TripDetailContext.Provider>
        </UserDetailContext.Provider>
    </ThemeProvider>;
}
createRoot(document.getElementById('root')).render(<App />);

