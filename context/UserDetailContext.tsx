import { createContext, Dispatch, SetStateAction } from "react";
import { Doc } from "@/convex/_generated/dataModel";

export type UserDetailType = Doc<"UserTable"> | null;

export interface UserDetailContextType {
  userDetail: UserDetailType;
  setUserDetail: Dispatch<SetStateAction<UserDetailType>>;
}

export const UserDetailContext = createContext<UserDetailContextType>({
  userDetail: null,
  setUserDetail: () => {},
});