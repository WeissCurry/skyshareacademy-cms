import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AdminProvider } from "@shared/context/AdminContext";

const CmsPrivateRoute = () => {
  const token = localStorage.getItem("authorization");
  return token ? (
    <AdminProvider>
      <Outlet />
    </AdminProvider>
  ) : (
    <Navigate to="/cms" />
  );
};

export default CmsPrivateRoute;
