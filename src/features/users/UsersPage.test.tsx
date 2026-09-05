import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { UsersPage } from "./UsersPage";
import { UserProvider } from "./UserContext";
import { UsersProvider } from "./UsersProvider";
import { useUser } from "../../hooks/useUser";
import type { User } from "../../types";

vi.mock("../../services/api/userService", () => ({
  userService: {
    getUsers: vi.fn().mockResolvedValue([
      {
        id: "usr-1",
        name: "Sarah Connor",
        email: "sarah@queuedesk.com",
        role: "manager",
      },
      {
        id: "usr-2",
        name: "Alex Mercer",
        email: "alex@queuedesk.com",
        role: "agent",
      },
    ]),
    createUser: vi.fn().mockResolvedValue({}),
    updateUser: vi.fn().mockResolvedValue({}),
    deleteUser: vi.fn().mockResolvedValue(undefined),
  },
}));

function UserSetter({ currentUser }: { currentUser: User }) {
  const { setCurrentUser } = useUser();
  React.useEffect(() => {
    setCurrentUser(currentUser);
  }, [currentUser, setCurrentUser]);
  return null;
}

const renderUsersPage = (user: User) => {
  return render(
    <MemoryRouter>
      <UserProvider>
        <UserSetter currentUser={user} />
        <UsersProvider>
          <UsersPage />
        </UsersProvider>
      </UserProvider>
    </MemoryRouter>,
  );
};

const manager: User = {
  id: "usr-1",
  name: "Sarah Connor",
  email: "sarah@queuedesk.com",
  role: "manager",
};

const agent: User = {
  id: "usr-2",
  name: "Alex Mercer",
  email: "alex@queuedesk.com",
  role: "agent",
};

describe("UsersPage", () => {
  it("shows a manager-only notice for agents", async () => {
    renderUsersPage(agent);

    await waitFor(() => {
      expect(screen.getByText("Manager-only view")).toBeInTheDocument();
    });
  });

  it("lists all users for a manager", async () => {
    renderUsersPage(manager);

    await waitFor(() => {
      expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
      expect(screen.getByText("Alex Mercer")).toBeInTheDocument();
    });
  });

  it("disables deleting your own account", async () => {
    renderUsersPage(manager);

    await waitFor(() => {
      const selfDelete = screen.getAllByRole("button", { name: "Delete" })[0];
      expect(selfDelete).toBeDisabled();
    });
  });

  it("assigns a new role to a user", async () => {
    const { userService } = await import("../../services/api/userService");
    renderUsersPage(manager);

    await waitFor(() => {
      const alexRole = screen.getByLabelText("Role for Alex Mercer");
      fireEvent.change(alexRole, { target: { value: "manager" } });
    });

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith("usr-2", {
        role: "manager",
      });
    });
    expect(screen.getAllByText("Manager").length).toBeGreaterThan(1);
  });

  it("deletes a user after confirmation", async () => {
    const { userService } = await import("../../services/api/userService");
    renderUsersPage(manager);

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      const alexDelete = deleteButtons.find(
        (b) => !(b as HTMLButtonElement).disabled,
      );
      expect(alexDelete).toBeDefined();
      fireEvent.click(alexDelete!);
    });

    expect(
      screen.getByRole("dialog", { name: "Delete user?" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete User" }));

    await waitFor(() => {
      expect(userService.deleteUser).toHaveBeenCalledWith("usr-2");
      expect(screen.queryByText("Alex Mercer")).not.toBeInTheDocument();
    });
  });

  it("creates a new user from the form", async () => {
    const { userService } = await import("../../services/api/userService");
    renderUsersPage(manager);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "+ Add User" }),
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "+ Add User" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "New Agent" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "new@queuedesk.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create User" }));

    await waitFor(() => {
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Agent",
          email: "new@queuedesk.com",
          role: "agent",
        }),
      );
    });
  });
});
