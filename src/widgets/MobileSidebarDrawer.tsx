import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Logo from "@shared/assets/images/logo placeholder.png";

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebarDrawer({
  isOpen,
  onClose,
}: MobileSidebarDrawerProps) {
  // Close on ESC key and prevent body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop with fade animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel with spring slide-in/out */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white border-r-2 border-black flex flex-col shadow-2xl z-10 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-background">
              <img className="w-36" src={Logo} alt="SkyShare Academy" />
              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-black bg-white hover:bg-rose-50 hover:text-rose-600 active:translate-x-[1px] active:translate-y-[1px] transition-all"
                aria-label="Tutup Menu"
              >
                <FiX className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <div className="p-4 flex-1 flex justify-center">
              <Sidebar onNavigate={onClose} className="w-full shadow-none border-none p-0" />
            </div>

            {/* Footer info */}
            <div className="p-4 border-t border-gray-100 text-[11px] font-bold text-gray-500 text-center">
              SkyShare Academy CMS
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
