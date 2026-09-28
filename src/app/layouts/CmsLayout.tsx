import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CmsNavbar from "@widgets/Navbar";

const CmsLayout = () => {
  const location = useLocation();

  return (
    <>
      <CmsNavbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="w-full"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default CmsLayout;

