import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const CmsLoginRoute = () => {
  const token = localStorage.getItem("authorization");
  return token ? <Navigate to="/cms/dashboard" /> : <Outlet />;
};

export default CmsLoginRoute;
