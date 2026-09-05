import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <Sidebar />
      <main className="pt-16 md:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
