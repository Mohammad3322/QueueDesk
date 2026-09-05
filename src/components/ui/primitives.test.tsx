import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Card } from "./Card";
import { Alert } from "./Alert";
import { Select } from "./Select";
import { Spinner } from "./Spinner";
import { TextArea } from "./TextArea";

describe("Badge", () => {
  it("renders children with default variant", () => {
    render(<Badge>Low</Badge>);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("applies success variant styling", () => {
    render(<Badge variant="success">On Track</Badge>);
    const badge = screen.getByText("On Track");
    expect(badge.className).toContain("bg-green-100");
  });

  it("applies danger variant styling", () => {
    render(<Badge variant="danger">Overdue</Badge>);
    expect(screen.getByText("Overdue").className).toContain("bg-red-100");
  });
});

describe("Button", () => {
  it("renders a button with the given text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("disables the button when disabled prop is set", () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No results" description="Try another filter." />);
    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.getByText("Try another filter.")).toBeInTheDocument();
  });

  it("calls onAction when action button is clicked", () => {
    let clicked = false;
    render(
      <EmptyState
        title="No results"
        description="Try another filter."
        actionLabel="Reset"
        onAction={() => {
          clicked = true;
        }}
      />,
    );
    screen.getByRole("button", { name: "Reset" }).click();
    expect(clicked).toBe(true);
  });
});

describe("Card", () => {
  it("renders an optional title heading", () => {
    render(<Card title="Overview">Body</Card>);
    expect(
      screen.getByRole("heading", { name: "Overview" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("renders with role and title", () => {
    render(
      <Alert variant="danger" title="Error">
        Something broke
      </Alert>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });

  it("calls onDismiss when the dismiss button is clicked", () => {
    let dismissed = false;
    render(
      <Alert
        onDismiss={() => {
          dismissed = true;
        }}
      >
        Note
      </Alert>,
    );
    screen.getByRole("button", { name: "Dismiss alert" }).click();
    expect(dismissed).toBe(true);
  });
});

describe("Select", () => {
  it("associates a label with the select via htmlFor", () => {
    render(
      <Select id="status" label="Status">
        <option value="open">Open</option>
      </Select>,
    );
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("renders an associated field error", () => {
    render(
      <Select id="status" label="Status" error="Required">
        <option value="open">Open</option>
      </Select>,
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Status")).toHaveAccessibleDescription(
      "Required",
    );
  });
});

describe("Spinner", () => {
  it("renders a status region with a label", () => {
    render(<Spinner label="Loading tickets..." />);
    expect(screen.getByRole("status")).toHaveAccessibleName(
      "Loading tickets...",
    );
  });

  it("renders custom label text", () => {
    render(<Spinner label="Loading dashboard..." />);
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });
});

describe("TextArea", () => {
  it("associates a label with the textarea", () => {
    render(<TextArea id="desc" label="Description" name="description" />);
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("renders an associated field error", () => {
    render(
      <TextArea
        id="desc"
        name="description"
        label="Description"
        error="Too short"
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Too short")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toHaveAccessibleDescription(
      "Too short",
    );
  });
});
