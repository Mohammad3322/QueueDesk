import type { User } from "../../types";
import { MOCK_USERS } from "../../mocks/generator";
import {
  USE_MOCK,
  API_URL,
  randomLatency,
  delay,
  throwIfAborted,
} from "./mockApi";

let memoryUsers: User[] = [...MOCK_USERS];

export const userService = {
  async getUsers(signal?: AbortSignal): Promise<User[]> {
    if (USE_MOCK) {
      await delay(randomLatency());
      throwIfAborted(signal);
      return [...memoryUsers];
    }
    const res = await fetch(`${API_URL}/users`, { signal });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },

  async createUser(input: User): Promise<User> {
    if (USE_MOCK) {
      await delay(randomLatency());
      memoryUsers = [...memoryUsers, input];
      return input;
    }
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Failed to create user");
    return res.json();
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    if (USE_MOCK) {
      await delay(randomLatency());
      memoryUsers = memoryUsers.map((u) =>
        u.id === id ? { ...u, ...updates } : u,
      );
      const updated = memoryUsers.find((u) => u.id === id);
      if (!updated) throw new Error(`User ${id} not found`);
      return updated;
    }
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  },

  async deleteUser(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(randomLatency());
      const exists = memoryUsers.some((u) => u.id === id);
      if (!exists) throw new Error(`User ${id} not found`);
      memoryUsers = memoryUsers.filter((u) => u.id !== id);
      return;
    }
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete user");
  },
};
