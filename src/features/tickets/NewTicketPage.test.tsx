import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NewTicketPage } from "./NewTicketPage";
import { UserProvider } from "../users/UserContext";
import { TicketProvider } from "./TicketContext";

vi.mock("../../services/api/ticketService", () => ({
  ticketService: {
    getTickets: vi.fn().mockResolvedValue([]),
  },
}));

function renderCreatePage() {
  return render(
    <MemoryRouter initialEntries={["/tickets/new"]}>
      <UserProvider>
        <TicketProvider>
          <Routes>
            <Route path="/tickets/new" element={<NewTicketPage />} />
            <Route path="/tickets/:ticketId" element={<div>Detail page</div>} />
          </Routes>
        </TicketProvider>
      </UserProvider>
    </MemoryRouter>,
  );
}

describe("NewTicketPage", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {
      /* suppress expected errors from failed validation */
    });
  });

  it("blocks submission when required fields are empty", async () => {
    const user = userEvent.setup();
    renderCreatePage();

    await user.click(screen.getByRole("button", { name: "Create Ticket" }));

    expect(screen.getByText("Please select a customer")).toBeInTheDocument();
    expect(screen.getByText("Subject is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
  });

  it("rejects a subject shorter than 5 characters", async () => {
    const user = userEvent.setup();
    renderCreatePage();

    // Pick a customer first to isolate the subject error.
    await user.selectOptions(screen.getByLabelText(/customer/i), "cust-1");
    await user.type(screen.getByLabelText(/subject/i), "abc");
    await user.type(
      screen.getByLabelText(/description/i),
      "This is a sufficiently long description",
    );

    await user.click(screen.getByRole("button", { name: "Create Ticket" }));

    expect(
      screen.getByText("Subject must be at least 5 characters"),
    ).toBeInTheDocument();
  });

  it("rejects a description shorter than 20 characters", async () => {
    const user = userEvent.setup();
    renderCreatePage();

    await user.selectOptions(screen.getByLabelText(/customer/i), "cust-1");
    await user.type(screen.getByLabelText(/subject/i), "Valid subject");
    await user.type(screen.getByLabelText(/description/i), "Too short");

    await user.click(screen.getByRole("button", { name: "Create Ticket" }));

    expect(
      screen.getByText("Description must be at least 20 characters"),
    ).toBeInTheDocument();
  });

  it("navigates to the detail page after successful creation", async () => {
    const user = userEvent.setup();
    renderCreatePage();

    await user.selectOptions(screen.getByLabelText(/customer/i), "cust-1");
    await user.type(
      screen.getByLabelText(/subject/i),
      "Billing refund not applied",
    );
    await user.type(
      screen.getByLabelText(/description/i),
      "Customer was charged twice and requests an immediate refund.",
    );

    await user.click(screen.getByRole("button", { name: "Create Ticket" }));

    expect(await screen.findByText("Detail page")).toBeInTheDocument();
  });
});
