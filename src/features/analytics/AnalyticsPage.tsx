import React from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useTickets } from "../../hooks/useTickets";
import { useUser } from "../../hooks/useUser";
import { canViewAnalytics } from "../../utils/permissions";
import { computeMetrics, formatDuration } from "../../utils/metrics";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { GoButton } from "../../components/ui/GoButton";
import { MOCK_USERS } from "../../mocks/generator";

const STATUS_COLORS: Record<string, string> = {
  open: "#2563eb",
  "in-progress": "#eab308",
  "waiting-on-customer": "#a855f7",
  resolved: "#22c55e",
  closed: "#6b7280",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#9ca3af",
  medium: "#2563eb",
  high: "#f59e0b",
  critical: "#dc2626",
};

export const AnalyticsPage: React.FC = () => {
  const { tickets } = useTickets();
  const { currentUser } = useUser();

  if (!canViewAnalytics(currentUser)) {
    return (
      <Card>
        <h1 className="text-xl font-bold text-gray-900 mb-3">
          Analytics Unavailable
        </h1>
        <Alert variant="warning" title="Manager-only view">
          Only managers can view support analytics
        </Alert>
      </Card>
    );
  }

  const metrics = computeMetrics(tickets);

  const statusData = metrics.byStatus.map((d) => ({
    name: d.status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: d.count,
  }));

  const priorityData = metrics.byPriority.map((d) => ({
    name: d.priority.toUpperCase(),
    value: d.count,
  }));

  const workloadData = metrics.byAssignee.map((d) => {
    const assignee = MOCK_USERS.find((u) => u.id === d.assigneeId);
    return {
      name: assignee ? assignee.name.split(" ")[0] : "Unassigned",
      tickets: d.count,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Analytics</h1>
        <p className="text-gray-500 text-sm">
          Team workload and ticket distribution overview
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary group hover:bg-primary transition-colors">
          <p className="text-xs font-semibold text-gray-500 uppercase group-hover:text-white transition-colors">
            Total
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:text-white transition-colors">
            {metrics.total}
          </p>
        </Card>
        <Card className="border-t-4 border-t-warning group  hover:bg-warning transition-colors">
          <p className="text-xs font-semibold text-gray-500 uppercase group-hover:text-white transition-colors">
            Critical
          </p>
          <p className="text-3xl font-bold text-red-600 mt-1 group-hover:text-white transition-colors">
            {metrics.critical}
          </p>
        </Card>
        <Card className="border-t-4 border-t-danger group  hover:bg-danger transition-colors">
          <p className="text-xs font-semibold text-gray-500 uppercase group-hover:text-white transition-colors">
            Overdue
          </p>
          <p className="text-3xl font-bold text-red-600 mt-1 group-hover:text-white transition-colors">
            {metrics.overdue}
          </p>
        </Card>
        <Card className="border-t-4 border-t-success group  hover:bg-success transition-colors">
          <p className="text-xs font-semibold text-gray-500 uppercase group-hover:text-white transition-colors">
            Avg Resolution
          </p>
          <p className="text-3xl font-bold text-green-600 mt-1 group-hover:text-white transition-colors">
            {metrics.avgResolutionMs !== null
              ? formatDuration(metrics.avgResolutionMs)
              : "—"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tickets by Status">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        STATUS_COLORS[
                          entry.name.toLowerCase().replace(" ", "-")
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Tickets by Priority">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Tickets" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PRIORITY_COLORS[entry.name.toLowerCase()]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Workload by Agent" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="tickets" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end mt-2">
            <Link to="/tickets">
              <GoButton child="Go" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
