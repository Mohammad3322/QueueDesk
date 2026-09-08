import React from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { MOCK_AGENTS, CATEGORIES_LIST } from "../../mocks/generator";

export const TicketFilters: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const priority = searchParams.get("priority") || "all";
  const assignee = searchParams.get("assignee") || "all";
  const category = searchParams.get("category") || "all";
  const sla = searchParams.get("sla") || "all";
  const sortBy = searchParams.get("sort") || "createdAt";
  const sortOrder = searchParams.get("order") || "desc";

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to the first page whenever filters change to avoid a blank page.
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <Input
          placeholder="Search by ID, subject, customer..."
          value={search}
          onChange={(e) => updateParam("search", e.target.value)}
        />

        {/* Status filter */}
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="waiting-on-customer">Waiting on Customer</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </Select>

        {/* Priority filter */}
        <Select
          aria-label="Filter by priority"
          value={priority}
          onChange={(e) => updateParam("priority", e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>

        {/* Category filter */}
        <Select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
        >
          <option value="all">All Categories</option>
          {CATEGORIES_LIST.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        {/* Assignee filter */}
        <Select
          aria-label="Filter by assignee"
          value={assignee}
          onChange={(e) => updateParam("assignee", e.target.value)}
        >
          <option value="all">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {MOCK_AGENTS.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {/* SLA status filter */}
          <Select
            aria-label="Filter by SLA status"
            fullWidth={false}
            className="w-52"
            value={sla}
            onChange={(e) => updateParam("sla", e.target.value)}
          >
            <option value="all">SLA Status: All</option>
            <option value="overdue">Overdue</option>
            <option value="due-soon">Due Soon</option>
            <option value="on-track">On Track</option>
          </Select>

          {/* Sort */}
          <Select
            aria-label="Sort tickets"
            fullWidth={false}
            className="w-60"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split("-");
              const newParams = new URLSearchParams(searchParams);
              newParams.set("sort", s);
              newParams.set("order", o);
              setSearchParams(newParams);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="priority-desc">Priority: High to Low</option>
            <option value="priority-asc">Priority: Low to High</option>
            <option value="dueAt-asc">Due Soonest</option>
            <option value="customerName-asc">Customer: A to Z</option>
            <option value="customerName-desc">Customer: Z to A</option>
          </Select>
        </div>

        <button
          onClick={handleReset}
          className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};
