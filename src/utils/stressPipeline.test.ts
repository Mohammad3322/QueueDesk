import { describe, it, expect, beforeAll } from "vitest";
import { generateMockTickets, MOCK_CUSTOMERS } from "../mocks/generator";
import { applyTicketPipeline } from "./ticketPipeline";
import { computeMetrics } from "./metrics";
import { getSLAStatus } from "./ticketHelpers";

const STRESS_SIZE = 10000;

const customerNameById = (id: string): string =>
  MOCK_CUSTOMERS.find((c) => c.id === id)?.name ?? "";

const measure = (fn: () => unknown): number => {
  const start = performance.now();
  fn();
  return performance.now() - start;
};

describe("10k ticket stress harness (README 11.3)", () => {
  let tickets: ReturnType<typeof generateMockTickets>;
  let report: Record<string, number>;

  beforeAll(() => {
    tickets = generateMockTickets(STRESS_SIZE);
    expect(tickets).toHaveLength(STRESS_SIZE);

    report = {
      generationMs: measure(() => generateMockTickets(STRESS_SIZE)),
      defaultQueryMs: measure(() =>
        applyTicketPipeline(
          tickets,
          { page: 3, pageSize: 10 },
          customerNameById,
        ),
      ),
      filteredQueryMs: measure(() =>
        applyTicketPipeline(
          tickets,
          { priority: "critical", sla: "overdue", page: 1, pageSize: 10 },
          customerNameById,
        ),
      ),
      searchQueryMs: measure(() =>
        applyTicketPipeline(
          tickets,
          { search: "Billing", page: 1, pageSize: 10 },
          customerNameById,
        ),
      ),
      customerNameSortMs: measure(() =>
        applyTicketPipeline(
          tickets,
          { sortBy: "customerName", sortOrder: "asc", page: 1, pageSize: 10 },
          customerNameById,
        ),
      ),
      metricsMs: measure(() => computeMetrics(tickets)),
      slaScanMs: measure(() => tickets.forEach((t) => getSLAStatus(t))),
    };

    console.log("[stress-harness] 10,000-ticket measurements");
    console.log(
      `  generationMs=${report.generationMs.toFixed(1)} ` +
        `defaultQueryMs=${report.defaultQueryMs.toFixed(1)} ` +
        `filteredQueryMs=${report.filteredQueryMs.toFixed(1)} ` +
        `searchQueryMs=${report.searchQueryMs.toFixed(1)} ` +
        `customerNameSortMs=${report.customerNameSortMs.toFixed(1)} ` +
        `metricsMs=${report.metricsMs.toFixed(1)} ` +
        `slaScanMs=${report.slaScanMs.toFixed(1)}`,
    );
  });

  it("generates the full 10k dataset deterministically", () => {
    expect(tickets[0].id).toBe("TICK-1001");
    expect(tickets[STRESS_SIZE - 1].id).toBe(`TICK-${1000 + STRESS_SIZE}`);
  });

  it("paginates the full dataset with correct totals", () => {
    const result = applyTicketPipeline(
      tickets,
      { page: 3, pageSize: 10 },
      customerNameById,
    );
    expect(result.totalItems).toBe(STRESS_SIZE);
    expect(result.totalPages).toBe(1000);
    expect(result.tickets).toHaveLength(10);
    expect(result.currentPage).toBe(3);
  });

  it("filters, sorts, and paginates a constrained query", () => {
    const result = applyTicketPipeline(
      tickets,
      { priority: "critical", sla: "overdue", page: 1, pageSize: 10 },
      customerNameById,
    );
    expect(result.tickets.length).toBeLessThanOrEqual(10);
    expect(result.totalItems).toBeGreaterThan(0);
    result.tickets.forEach((t) => {
      expect(t.priority).toBe("critical");
      expect(getSLAStatus(t)).toBe("overdue");
    });
  });

  it("searches across subject, id, and customer name", () => {
    const result = applyTicketPipeline(
      tickets,
      { search: "Billing", page: 1, pageSize: 10 },
      customerNameById,
    );
    expect(result.totalItems).toBeGreaterThan(0);
  });

  it("sorts by customer name ascending", () => {
    const result = applyTicketPipeline(
      tickets,
      { sortBy: "customerName", sortOrder: "asc", page: 1, pageSize: 10 },
      customerNameById,
    );
    const names = result.tickets.map((t) => customerNameById(t.customerId));
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
  });

  it("computes metrics over the full dataset", () => {
    const metrics = computeMetrics(tickets);
    expect(metrics.total).toBe(STRESS_SIZE);
    expect(metrics.byStatus.reduce((s, g) => s + g.count, 0)).toBe(STRESS_SIZE);
    expect(metrics.byPriority.reduce((s, g) => s + g.count, 0)).toBe(
      STRESS_SIZE,
    );
  });
});
