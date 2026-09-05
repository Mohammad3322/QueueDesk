import React from "react";
import { useUser } from "../hooks/useUser";
import { MOCK_USERS } from "../mocks/users";

export const Header: React.FC = () => {
  const { currentUser, switchUser } = useUser();

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="border-blue-600 bg-white font-bold p-2 rounded-lg text-lg leading-none">
          <img src="/src/assets/Logo.png" className="w-12" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          QueueDesk
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* مبدّل الحسابات المحاكي */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1.5">
          <label
            htmlFor="user-select"
            className="text-xs font-medium text-gray-500 pl-1"
          >
            Role:
          </label>
          <select
            id="user-select"
            value={currentUser.id}
            onChange={(e) => switchUser(e.target.value)}
            className="text-xs bg-white border border-gray-300 rounded md:px-2 py-1 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MOCK_USERS.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200"
          />
        </div>
      </div>
    </header>
  );
};
