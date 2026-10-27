"use client";

import React, { useEffect } from 'react';
import Header from './_components/Header';
import SiteMotion from './_components/SiteMotion';
import PageLoader from './_components/PageLoader';
import { api } from '@/convex/_generated/api';
import { useMutation, useConvexAuth } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { UserDetailContext, UserDetailType } from '@/context/UserDetailContext';
import { useState } from 'react';
import { useContext } from 'react';
import { TripContextType, TripDetailContext } from '@/context/TripDetailContext';
import { TripInfo } from './create-new-trip/_components/types';


function AccountProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const createUser = useMutation(api.user.CreateNewUser);
  const [userDetail, setUserDetail] = useState<UserDetailType>(null);
  const [accountError, setAccountError] = useState<Error | null>(null);
  const [tripDetailInfo, setTripDetailInfo] = useState<TripInfo | null>(null);
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();

  useEffect(() => {
    let isSubscribed = true;
    if (user && isAuthenticated) {
      void createUser({
        email: user?.primaryEmailAddress?.emailAddress ?? '',
        name: user?.fullName ?? '',
        imageUrl: user?.imageUrl ?? '',
      }).then((result) => {
        if (isSubscribed) {
          setUserDetail(result as UserDetailType);
        }
      }).catch(() => {
        if (isSubscribed) setAccountError(new Error('Your account could not be loaded. Please try again.'));
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, [user, isAuthenticated, createUser]);

  // Use the existing application error boundary instead of leaving account-
  // dependent screens in an endless loading state after initialization fails.
  if (accountError) throw accountError;

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <TripDetailContext.Provider value={{ tripDetailInfo, setTripDetailInfo }}>
        <div>
          <PageLoader />
          <Header />
          <SiteMotion>{children}</SiteMotion>
        </div>
      </TripDetailContext.Provider>
    </UserDetailContext.Provider>
  )
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  // Account changes discard cached trips/profile before rendering another user.
  return <AccountProvider key={(user?.id ?? 'signed-out') + ':' + isAuthenticated}>{children}</AccountProvider>;
}

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

