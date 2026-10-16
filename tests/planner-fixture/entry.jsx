import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import Planner from '../../app/create-new-trip/page';
import { HomeHeader } from '../../app/_components/HomeHeader';
import { TripDetailContext } from '../../context/TripDetailContext';
import { UserDetailContext } from '../../context/UserDetailContext';
import TripItemModal from '../../app/create-new-trip/_components/TripItemModal';

window.fixtureMutations = [];
function App() {
    const [tripDetailInfo, setTripDetailInfo] = useState(window.PLANNER_FIXTURE.trip || null);
    const [userDetail, setUserDetail] = useState({ _id:'fixture-user', name:'UI test traveler', email:'fixture@example.test' });
    return <ThemeProvider attribute="class" defaultTheme={window.PLANNER_FIXTURE.theme} enableSystem>
        <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
            <TripDetailContext.Provider value={{ tripDetailInfo, setTripDetailInfo }}>
                <HomeHeader />{new URLSearchParams(location.search).get('fixture') === 'notes'
                    ? <TripItemModal isOpen onClose={() => {}} item={{type:'hotel',title:'Fixture hotel',subtitle:'Test destination',description:'Isolated note test',imageUrl:'/beach.jpg',price:'100',rating:4,geoCoordinates:{lat:0,lng:0}}} />
                    : <Planner />}
            </TripDetailContext.Provider>
        </UserDetailContext.Provider>
    </ThemeProvider>;
}
createRoot(document.getElementById('root')).render(<App />);

