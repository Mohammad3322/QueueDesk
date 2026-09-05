import { useContext } from "react";
import {
  UsersStoreContext,
  type UsersStoreContextType,
} from "../features/users/usersStoreContext";

export const useUsers = (): UsersStoreContextType => {
  const context = useContext(UsersStoreContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
};
