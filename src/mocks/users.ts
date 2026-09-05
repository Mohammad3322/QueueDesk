import type { User } from "../types";

export const MOCK_USERS: User[] = [
  {
    id: "user-agent-1",
    name: "Alex Agent",
    email: "alex@queuedesk.com",
    role: "agent",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: "user-manager-1",
    name: "Morgan Manager",
    email: "morgan@queuedesk.com",
    role: "manager",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan",
  },
];