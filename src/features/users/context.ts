import { createContext } from "react";
import type { User } from "../../types";

export interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);
