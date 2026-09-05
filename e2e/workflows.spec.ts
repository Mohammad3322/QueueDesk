import { test, expect, type Page } from "@playwright/test";

const waitForTicketsTable = async (page: Page) => {
  await expect(
    page.getByRole("table").locator("tbody tr").first(),
  ).toBeVisible();
};

const ticketPathFromUrl = (url: string) =>
  url.split("/").pop() ?? "";

test.describe("Core E2E workflows", () => {
  test("WF1: filter critical tickets, open one, change status, verify activity", async ({
    page,
  }) => {
    await page.goto("/tickets");
    await waitForTicketsTable(page);

    await page.getByLabel("Filter by priority").selectOption("critical");
    await waitForTicketsTable(page);

    const firstRow = page.getByRole("table").locator("tbody tr").first();
    const ticketLink = firstRow.locator("td").first().locator("a");
    await expect(ticketLink).toBeVisible();

    await ticketLink.click();
    await expect(page).toHaveURL(/\/tickets\/TICK-/);
    const ticketId = ticketPathFromUrl(page.url());

    await expect(
      page.getByRole("heading", { name: ticketId }),
    ).toBeVisible();

    await page.getByLabel("Status").selectOption({ label: "In Progress" });
    await expect(page.getByLabel("Status")).toHaveValue("in-progress");
    await expect(
      page.getByText('Status changed to "in-progress".'),
    ).toBeVisible();
  });

  test("WF2: create a ticket and confirm it appears in the list", async ({
    page,
  }) => {
    const subject = `E2E ticket ${Date.now()}`;

    await page.goto("/tickets/new");

    await page.locator("#customer").selectOption({ index: 1 });
    await page.locator("#subject").fill(subject);
    await page.locator("#category").selectOption("Billing");
    await page.locator("#priority").selectOption("high");
    await page
      .locator("#description")
      .fill("Created by automated end-to-end test (WF2).");

    await page.getByRole("button", { name: "Create Ticket" }).click();

    await expect(page).toHaveURL(/\/tickets\/TICK-/);
    const createdId = ticketPathFromUrl(page.url());

    await expect(
      page.getByRole("heading", { name: createdId }),
    ).toBeVisible();
    await expect(page.getByText(subject, { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "← Back" }).click();
    await expect(page).toHaveURL(/\/tickets\/?$/);
    await waitForTicketsTable(page);

    await page
      .getByPlaceholder("Search by ID, subject, customer...")
      .fill(subject);
    await expect(
      page.getByRole("table").getByText(subject, { exact: true }),
    ).toBeVisible();
  });

  test("WF3: switch to Manager, assign an unassigned ticket, verify timeline", async ({
    page,
  }) => {
    await page.goto("/");

    await page.locator("#user-select").selectOption("usr-2");
    await expect(page.locator("#user-select")).toHaveValue("usr-2");

    await page.locator("#user-select").selectOption("usr-1");
    await expect(page.locator("#user-select")).toHaveValue("usr-1");

    await page.goto("/tickets");
    await waitForTicketsTable(page);

    await page.getByLabel("Filter by assignee").selectOption("unassigned");
    await waitForTicketsTable(page);

    const firstRow = page.getByRole("table").locator("tbody tr").first();
    const ticketLink = firstRow.locator("td").first().locator("a");
    await expect(ticketLink).toBeVisible();

    await ticketLink.click();
    await expect(page).toHaveURL(/\/tickets\/TICK-/);
    const ticketId = ticketPathFromUrl(page.url());

    await expect(
      page.getByRole("heading", { name: ticketId }),
    ).toBeVisible();

    await page.getByLabel("Assignee").selectOption("usr-2");
    await expect(page.getByLabel("Assignee")).toHaveValue("usr-2");

    await expect(
      page.getByText("Ticket assigned to Alex Mercer."),
    ).toBeVisible();
  });

test("WF4: manage users and delete a ticket as the administrator", async ({
    page,
  }) => {
    // The default persona is Sarah Connor (manager / administrator).
    await page.goto("/users");
    await expect(
      page.getByRole("heading", { name: "Team & Roles" }),
    ).toBeVisible();

    // Create a team member; they appear in the directory and the role switcher.
    await page.getByRole("button", { name: "+ Add User" }).click();
    await page.getByLabel("Full name").fill("E2E Agent");
    await page.getByLabel("Email address").fill("e2e@queuedesk.com");
    await page.getByRole("button", { name: "Create User" }).click();
    await expect(
      page.getByRole("table").getByText("E2E Agent"),
    ).toBeVisible();
    await expect(page.locator("#user-select")).toContainText("E2E Agent");

    // Switching the persona to an agent while on the page shows the gate.
    await page.locator("#user-select").selectOption("usr-2");
    await expect(page.getByText("Manager-only view")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Team & Roles" }),
    ).toHaveCount(0);

    // Back as manager, the directory and sidebar link return.
    await page.locator("#user-select").selectOption("usr-1");
    await expect(
      page.getByRole("heading", { name: "Team & Roles" }),
    ).toBeVisible();

    // Open the account page via sidebar (client-side navigation).
    await page.getByRole("link", { name: "My Account" }).click();
    await expect(
      page.getByRole("heading", { name: "My Account" }),
    ).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveValue("Sarah Connor");

    // Navigate to tickets and delete one from the table.
    await page.getByRole("link", { name: "Tickets" }).click();
    await waitForTicketsTable(page);

    const deleteButton = page
      .getByRole("button", { name: /Delete TICK-\d+/ })
      .first();
    await expect(deleteButton).toBeVisible();
    const label = (await deleteButton.getAttribute("aria-label")) ?? "";
    await deleteButton.click();

    await expect(
      page.getByRole("dialog", { name: "Delete ticket?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Delete Ticket" }).click();
    await expect(page.getByRole("button", { name: label })).toHaveCount(0);
  });
});