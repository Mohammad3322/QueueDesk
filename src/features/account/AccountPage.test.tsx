import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccountPage } from "./AccountPage";
import { UserProvider } from "../users/UserContext";
import { UsersProvider } from "../users/UsersProvider";

vi.mock("../../services/api/userService", () => ({
  userService: {
    getUsers: vi.fn().mockResolvedValue([
      {
        id: "usr-1",
        name: "Sarah Connor",
        email: "sarah@queuedesk.com",
        role: "manager",
      },
    ]),
    updateUser: vi.fn().mockResolvedValue({}),
  },
}));

const renderAccountPage = () => {
  return render(
    <MemoryRouter>
      <UserProvider>
        <UsersProvider>
          <AccountPage />
        </UsersProvider>
      </UserProvider>
    </MemoryRouter>,
  );
};

describe("AccountPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the current user's profile", async () => {
    renderAccountPage();

    await waitFor(() => {
      expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
      expect(screen.getByText("Manager")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Full name")).toHaveValue("Sarah Connor");
    expect(screen.getByLabelText("Email address")).toHaveValue(
      "sarah@queuedesk.com",
    );
  });

  it("blocks saving with an invalid email", async () => {
    renderAccountPage();

    await waitFor(() => {
      expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(
        screen.getByText("Enter a valid email address."),
      ).toBeInTheDocument();
    });
  });

  it("saves profile changes and confirms with a success message", async () => {
    const { userService } = await import("../../services/api/userService");
    renderAccountPage();

    await waitFor(() => {
      expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Sarah Jane Connor" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith("usr-1", {
        name: "Sarah Jane Connor",
        email: "sarah@queuedesk.com",
      });
    });
    await waitFor(() => {
      expect(screen.getByText("Profile updated")).toBeInTheDocument();
    });
  });
});
