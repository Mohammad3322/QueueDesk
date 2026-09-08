import React, { useState, useCallback } from "react";
import type { User } from "../../types";
import { MOCK_USERS } from "../../mocks/generator";
import { UserContext, type UserContextType } from "./context";

const STORAGE_KEY = "queuedesk_user_id";

function loadStoredUser(): User | null {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    if (!id) return null;
    return MOCK_USERS.find((u) => u.id === id) ?? null;
  } catch {
    return null;
  }
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const stored = loadStoredUser();
  const [currentUser, setCurrentUser] = useState<User>(stored ?? MOCK_USERS[1]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    stored !== null,
  );

  const login = useCallback((email: string, password: string): boolean => {
    const user = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    );
    if (!user) return false;
    try {
      localStorage.setItem(STORAGE_KEY, user.id);
    } catch {
      /* quota exceeded – ignore */
    }
    setCurrentUser(user);
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setCurrentUser(MOCK_USERS[1]);
    setIsAuthenticated(false);
  }, []);

  const value: UserContextType = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
