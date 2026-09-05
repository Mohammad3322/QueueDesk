import React from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { canManageUsers, canViewAnalytics } from "../utils/permissions";

export const Sidebar: React.FC = () => {
  const { currentUser } = useUser();

  const navItems = [
    { label: "Dashboard", path: "/", icon: "▦" },
    { label: "Tickets", path: "/tickets", icon: "☰" },
    { label: "New Ticket", path: "/tickets/new", icon: "＋" },
    ...(canViewAnalytics(currentUser)
      ? [{ label: "Analytics", path: "/analytics", icon: "📊" }]
      : []),
  ];

  const accountItems = [
    ...(canManageUsers(currentUser)
      ? [{ label: "Team & Roles", path: "/users", icon: "⚙" }]
      : []),
    { label: "My Account", path: "/account", icon: "◉" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 z-20 hidden md:block p-4">
      <nav aria-label="Main navigation" className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <span aria-hidden="true" className="w-5 text-center">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-gray-200 space-y-1">
          {accountItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <span aria-hidden="true" className="w-5 text-center">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};
