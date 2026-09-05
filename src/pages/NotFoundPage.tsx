import React from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 text-center space-y-4">
      <p className="text-5xl font-black text-gray-300">404</p>
      <h1 className="text-xl font-bold text-gray-900">Page Not Found</h1>
      <p className="text-gray-500 text-sm">
        The page you are looking for does not exist or has moved.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Back to Dashboard
        </Link>
        <Link
          to="/tickets"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View Tickets
        </Link>
      </div>
    </div>
  );
};
