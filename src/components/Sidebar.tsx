import React from "react";
import { NavLink } from "react-router-dom";

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Tickets", path: "/tickets" },
    { label: "New Ticket", path: "/tickets/new" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 z-20 hidden md:block p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
