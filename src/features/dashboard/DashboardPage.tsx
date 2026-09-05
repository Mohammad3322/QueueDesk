import React from "react";
import { Card } from "../../components/ui/Card";
import { useUser } from "../../hooks/useUser";

export const DashboardPage: React.FC = () => {
  const { currentUser } = useUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Welcome back, {currentUser.name}
        </p>
      </div>

      <Card title="System Overview">
        <p className="text-gray-600 text-sm">
          Phase 1 Foundation and Application Shell is active. Current Role:{" "}
          <span className="font-semibold text-blue-600">
            {currentUser.role}
          </span>
        </p>
      </Card>
    </div>
  );
};
