import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { APP_ROUTES } from "../constants";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.login} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
