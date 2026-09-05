import React, { useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "../../types";
import { userService } from "../../services/api/userService";
import { UsersStoreContext } from "./usersStoreContext";

export const UsersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
      setLoadState("success");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setLoadState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load users",
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await userService.getUsers();
        if (cancelled) return;
        setUsers(data);
        setLoadState("success");
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load users",
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const createUser = async (user: User) => {
    setUsers((prev) => [...prev, user]);
    await userService.createUser(user);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    );
    await userService.updateUser(id, updates);
  };

  const deleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    await userService.deleteUser(id);
  };

  return (
    <UsersStoreContext.Provider
      value={{
        users,
        loadState,
        errorMessage,
        refresh,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UsersStoreContext.Provider>
  );
};
