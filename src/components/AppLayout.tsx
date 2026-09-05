import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useUser } from "../hooks/useUser";
import { canManageUsers, canViewAnalytics } from "../utils/permissions";

export const AppLayout: React.FC = () => {
  const { currentUser } = useUser();

  const mobileNav = [
    { label: "Home", path: "/", end: true },
    { label: "Tickets", path: "/tickets" },
    { label: "New", path: "/tickets/new" },
    ...(canViewAnalytics(currentUser)
      ? [{ label: "Analytics", path: "/analytics" }]
      : []),
    ...(canManageUsers(currentUser)
      ? [{ label: "Users", path: "/users" }]
      : []),
    { label: "Account", path: "/account" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <Sidebar />
      <main className="pt-16 md:pl-64 min-h-screen pb-20 md:pb-8">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation for mobile */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30 grid"
        style={{
          gridTemplateColumns: `repeat(${mobileNav.length}, minmax(0, 1fr))`,
        }}
      >
        {mobileNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center py-2.5 text-[11px] font-medium ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
