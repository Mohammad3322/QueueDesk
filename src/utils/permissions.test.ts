import { describe, it, expect } from "vitest";
import {
  canAssignTicket,
  canChangePriority,
  canClaimTicket,
  canDeleteTickets,
  canEditTicket,
  canManageUsers,
  canViewAnalytics,
} from "./permissions";
import type { User, Ticket } from "../types";

const agent: User = {
  id: "usr-2",
  name: "Alex",
  email: "alex@queuedesk.com",
  role: "agent",
};
const manager: User = {
  id: "usr-1",
  name: "Sarah",
  email: "sarah@queuedesk.com",
  role: "manager",
};

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: "TICK-1001",
  subject: "Test",
  description: "Desc",
  customerId: "cust-1",
  status: "open",
  priority: "low",
  category: "General",
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  dueAt: new Date().toISOString(),
  ...overrides,
});

describe("permissions", () => {
  it("only managers can assign tickets", () => {
    expect(canAssignTicket(manager)).toBe(true);
    expect(canAssignTicket(agent)).toBe(false);
  });

  it("only managers can set critical priority", () => {
    expect(canChangePriority(manager, "critical")).toBe(true);
    expect(canChangePriority(agent, "critical")).toBe(false);
  });

  it("any user can set non-critical priority", () => {
    expect(canChangePriority(agent, "high")).toBe(true);
    expect(canChangePriority(agent, "low")).toBe(true);
  });

  it("only managers can view analytics", () => {
    expect(canViewAnalytics(manager)).toBe(true);
    expect(canViewAnalytics(agent)).toBe(false);
  });

  it("managers can edit any ticket", () => {
    expect(canEditTicket(manager, makeTicket())).toBe(true);
  });

  it("agents can edit tickets assigned to them", () => {
    const myTicket = makeTicket({ assigneeId: "usr-2" });
    expect(canEditTicket(agent, myTicket)).toBe(true);
  });

  it("agents cannot edit tickets assigned to others", () => {
    const otherTicket = makeTicket({ assigneeId: "usr-3" });
    expect(canEditTicket(agent, otherTicket)).toBe(false);
  });

  it("agents can claim an unassigned ticket", () => {
    const unassigned = makeTicket({ assigneeId: undefined });
    expect(canClaimTicket(agent, unassigned)).toBe(true);
    expect(canEditTicket(agent, unassigned)).toBe(true);
  });

  it("managers cannot claim but can assign", () => {
    const unassigned = makeTicket({ assigneeId: undefined });
    expect(canClaimTicket(manager, unassigned)).toBe(false);
    expect(canAssignTicket(manager)).toBe(true);
  });

  it("only managers can manage users", () => {
    expect(canManageUsers(manager)).toBe(true);
    expect(canManageUsers(agent)).toBe(false);
  });

  it("only managers can delete tickets", () => {
    expect(canDeleteTickets(manager)).toBe(true);
    expect(canDeleteTickets(agent)).toBe(false);
  });
});
