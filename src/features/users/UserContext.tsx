import React, { useState } from "react";
import type { User } from "../../types";
import { MOCK_USERS } from "../../mocks/generator";
import { UserContext, type UserContextType } from "./context";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  const value: UserContextType = { currentUser, setCurrentUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
