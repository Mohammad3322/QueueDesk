import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useUser } from "../hooks/useUser";
import { canManageUsers, canViewAnalytics } from "../utils/permissions";
import { APP_ROUTES } from "../constants";

// import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PeopleIcon from "@mui/icons-material/People";

export const AppLayout: React.FC = () => {
  // const [value, setValue] = React.useState("dashboard");

  // const handleChange = (event: React.SyntheticEvent, newValue: string) => {
  //   setValue(newValue);
  // };

  const { currentUser } = useUser();

  const mobileNav = [
    {
      label: "Dashboard",
      path: APP_ROUTES.dashboard,
      end: true,
      icon: <DashboardIcon />,
    },
    {
      label: "Tickets",
      path: APP_ROUTES.tickets,
      icon: <AutoAwesomeMotionIcon />,
    },

    { label: "New", path: APP_ROUTES.newTicket, icon: <AddCircleIcon /> },
    {
      label: "Alerts",
      path: APP_ROUTES.notifications,
      icon: <NotificationsIcon />,
    },
    ...(canViewAnalytics(currentUser)
      ? [
          {
            label: "Analytics",
            path: APP_ROUTES.analytics,
            icon: <AnalyticsIcon />,
          },
        ]
      : []),
    ...(canManageUsers(currentUser)
      ? [{ label: "Users", path: APP_ROUTES.users, icon: <PeopleIcon /> }]
      : []),
    { label: "Account", path: APP_ROUTES.account, icon: <AccountCircleIcon /> },
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
                isActive
                  ? "text-bg-primary-600"
                  : "text-gray-500 hover:text-gray-900"
              }`
            }
          >
            <BottomNavigationAction
              style={{ width: "80%" }}
              label={item.label}
              // value="dashboard"
              icon={item.icon}
            />
          </NavLink>
        ))}
      </nav>
      {/* <div className="md:hidden fixed bottom-0 left-0 right-0">
        <BottomNavigation
          // sx={{ width: 400 }}
          style={{ width: "100%" }}
          value={value}
          onChange={handleChange}
        >
          {mobileNav.map((item) => (
            <BottomNavigationAction
              sx={{ width: 5 }}
              style={{ width: "80%" }}
              label={item.label}
              value="dashboard"
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </div> */}
    </div>
  );
};
