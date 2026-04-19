import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const CmsPrivateRoute = () => {
  const token = localStorage.getItem("authorization");
  return token ? <Outlet /> : <Navigate to="/cms" />;
};

export default CmsPrivateRoute;
