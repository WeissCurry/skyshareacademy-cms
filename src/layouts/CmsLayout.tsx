import React from "react";
import { Outlet } from "react-router-dom";
import CmsNavbar from "@components/cms/CmsNavbar";

const CmsLayout = () => {
  return (
    <>
      <CmsNavbar />
      <Outlet />
    </>
  );
};

export default CmsLayout;
