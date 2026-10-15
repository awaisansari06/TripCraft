"use client";

import React, { useEffect } from 'react';
import Header from './_components/Header';
import SiteMotion from './_components/SiteMotion';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { UserDetailContext, UserDetailType } from '@/context/UserDetailContext';
import { useState } from 'react';
import { useContext } from 'react';
import { TripContextType, TripDetailContext } from '@/context/TripDetailContext';
import { TripInfo } from './create-new-trip/_components/types';


function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const createUser = useMutation(api.user.CreateNewUser);
  const [userDetail, setUserDetail] = useState<UserDetailType>(null);
  const [tripDetailInfo, setTripDetailInfo] = useState<TripInfo | null>(null);
  const { user } = useUser();

  useEffect(() => {
    let isSubscribed = true;
    if (user) {
      void createUser({
        email: user?.primaryEmailAddress?.emailAddress ?? '',
        name: user?.fullName ?? '',
        imageUrl: user?.imageUrl ?? '',
      }).then((result) => {
        if (isSubscribed) {
          setUserDetail(result as UserDetailType);
        }
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, [user, createUser]);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <TripDetailContext.Provider value={{ tripDetailInfo, setTripDetailInfo }}>
        <div>
          <Header />
          <SiteMotion>{children}</SiteMotion></div>
      </TripDetailContext.Provider>
    </UserDetailContext.Provider>
  )
}

export default Provider

export const useUserDetail = () => {
  return useContext(UserDetailContext);
}

export const useTripDetail = (): TripContextType => {
  const context = useContext(TripDetailContext);
  if (!context) {
    throw new Error("UseTripDetail must be used within TripDetailProvider");
  }
  return context;
}

