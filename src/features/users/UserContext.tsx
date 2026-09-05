import React, { useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../../types";
import { MOCK_USERS } from "../../mocks/users";
import { UserContext } from "./context";

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  const switchUser = (userId: string) => {
    const selectedUser = MOCK_USERS.find((u) => u.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, switchUser }}>
      {children}
    </UserContext.Provider>
  );
};
