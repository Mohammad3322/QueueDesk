import React from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useNotifications } from "../hooks/useNotifications";
import { canManageUsers, canViewAnalytics } from "../utils/permissions";
import { APP_ROUTES } from "../constants";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PeopleIcon from "@mui/icons-material/People";

interface NavItem {
  label: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { currentUser } = useUser();
  const { unreadCountFor } = useNotifications();
  const unread = unreadCountFor(currentUser.id);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      path: APP_ROUTES.dashboard,
      icon: <DashboardIcon />,
    },
    {
      label: "Tickets",
      path: APP_ROUTES.tickets,
      icon: <AutoAwesomeMotionIcon />,
    },
    { label: "New Ticket", path: APP_ROUTES.newTicket, icon: <AddBoxIcon /> },
    ...(canViewAnalytics(currentUser)
      ? [
          {
            label: "Analytics",
            path: APP_ROUTES.analytics,
            icon: <AnalyticsIcon />,
          },
        ]
      : []),
  ];

  const accountItems: NavItem[] = [
    {
      label: "Notifications",
      path: APP_ROUTES.notifications,
      icon: <NotificationsIcon />,
      badge: unread > 0 ? unread : undefined,
    },
    ...(canManageUsers(currentUser)
      ? [
          {
            label: "Team & Roles",
            path: APP_ROUTES.users,
            icon: <PeopleIcon />,
          },
        ]
      : []),
    {
      label: "My Account",
      path: APP_ROUTES.account,
      icon: <AccountCircleIcon />,
    },
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
              {item.badge !== undefined && (
                <span
                  className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold"
                  aria-label={`${item.badge} unread`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};
