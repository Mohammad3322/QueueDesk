import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useUsers } from "../hooks/useUsers";
import { useNotifications } from "../hooks/useNotifications";
import { APP_ROUTES } from "../constants";
import NotificationsIcon from "@mui/icons-material/Notifications";

export const Header: React.FC = () => {
  const { currentUser, setCurrentUser } = useUser();
  const { users } = useUsers();
  const { unreadCountFor } = useNotifications();
  const unread = unreadCountFor(currentUser.id);

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src="/Logo.png"
          alt="QueueDesk logo"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
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
            className="text-xs bg-white border border-gray-300 rounded md:px-2 py-1 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[16px] truncate"
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
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span aria-hidden="true" className="text-lg leading-none">
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
      </div>
    </header>
  );
};
