import { createContext } from "react";
import type { User } from "../../types";

export interface UserContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);