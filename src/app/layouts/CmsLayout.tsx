import React from "react";
import { Outlet } from "react-router-dom";
import CmsNavbar from "@widgets/Navbar";

const CmsLayout = () => {
  return (
    <>
      <CmsNavbar />
      <Outlet />
    </>
  );
};

export default CmsLayout;
