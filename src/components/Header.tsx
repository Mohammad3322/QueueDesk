import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useUsers } from "../hooks/useUsers";
import { useNotifications } from "../hooks/useNotifications";
import { APP_ROUTES } from "../constants";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

export const Header: React.FC = () => {
  const { currentUser, setCurrentUser, logout } = useUser();
  const navigate = useNavigate();
  const { users } = useUsers();
  const { unreadCountFor } = useNotifications();
  const unread = unreadCountFor(currentUser.id);

  return (
    <header className="bg-primary-header bg-op border-b border-gray-200 h-18 fixed top-0 left-0 right-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-14 h-14 bg-white rounded-full">
          <img
            src="/Logo.png"
            alt="QueueDesk logo"
            className="w-10 h-10 object-contain"
          />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          QueueDesk
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="  items-center gap-2 hidden md:flex bg-gray-50 border border-gray-200 rounded-lg p-1.5">
          <label
            htmlFor="user-select"
            className="text-xs font-medium text-gray-500 pl-1"
          >
            Role:
          </label>
          <select
            id="user-select"
            value={currentUser.id}
            onChange={(e) => {
              const user = users.find((u) => u.id === e.target.value);
              if (user) setCurrentUser(user);
            }}
            className="text-xs bg-white border border-gray-300 rounded md:px-2 py-1 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name.substring(0, 7)} ({user.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Role */}
        <div className="  items-center gap-2  md:hidden bg-gray-50 border border-gray-200 rounded-lg p-1.5">
          <label
            htmlFor="user-select"
            className="text-xs font-medium text-gray-500 pl-1"
          >
            Role:
          </label>
          <select
            id="user-select"
            value={currentUser.id}
            onChange={(e) => {
              const user = users.find((u) => u.id === e.target.value);
              if (user) setCurrentUser(user);
            }}
            className="text-xs bg-white border border-gray-300 rounded md:px-2 py-1 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-4 truncate"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name.substring(0, 7)} ({user.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={APP_ROUTES.notifications}
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span aria-hidden="true" className="text-white leading-none">
              <NotificationsIcon />
            </span>
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold"
                aria-hidden="true"
              >
                {unread}
              </span>
            )}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.avatarUrl && (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              logout();
              navigate(APP_ROUTES.login);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            title="Sign out"
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
