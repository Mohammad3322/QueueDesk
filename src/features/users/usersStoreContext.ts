import { createContext } from "react";
import type { User } from "../../types";

export interface UsersStoreContextType {
  users: User[];
  loadState: "loading" | "success" | "error";
  errorMessage: string | null;
  refresh: () => Promise<void>;
  createUser: (user: User) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const UsersStoreContext = createContext<
  UsersStoreContextType | undefined
>(undefined);
