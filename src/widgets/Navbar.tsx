import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";

import skyshareApi from "@shared/api/skyshareApi";
import Logo from "@shared/assets/images/logo placeholder.png";
import IconButton from "@shared/assets/images/mascot-icons/Logout.png";
import MobileSidebarDrawer from "./MobileSidebarDrawer";

function CmsNavbar() {
  interface AdminData {
    name: string;
    role: string;
  }
  const [dataAdmin, setDataAdmin] = useState<AdminData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getDataadmin = async function () {
      try {
        const dataAdminFromServer = await skyshareApi.get("/admin/info");
        setDataAdmin(dataAdminFromServer.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    getDataadmin();
  }, []);

  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem("authorization");
    delete skyshareApi.defaults.headers.common["authorization"];
  }
  const handleLogout = () => {
    logout();
    navigate("/cms");
  };

  return (
    <>
      <div className="bg-neutral-white justify-center items-center flex py-4 md:py-6 px-4 md:px-0 border-b border-gray-100">
        <div className="flex self-stretch items-center w-full max-w-[1100px] justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Hamburger button visible only on mobile / tablet */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border-2 border-black bg-background hover:bg-gray-200 transition-all text-black active:translate-x-[1px] active:translate-y-[1px]"
              aria-label="Buka Menu Navigasi"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            <Link to="/">
              <img className="w-36 md:w-44" src={Logo} alt="SkyShare Academy" />
            </Link>
          </div>

          <div className="flex gap-3 items-center">
            {dataAdmin && (
              <div className="text-right">
                <h4 className="headline-4 text-xs sm:text-base leading-tight">{dataAdmin.name}</h4>
                <p className="paragraph text-[10px] sm:text-sm text-gray-500 -mt-0.5">{dataAdmin.role}</p>
              </div>
            )}
            <div>
              <button
                onClick={handleLogout}
                className="bg-primary-1 hover:bg-primary-2 py-2 sm:py-3 px-2 sm:px-3 rounded-xl transition-colors"
                title="Keluar / Logout"
              >
                <img className="w-6 sm:w-8" src={IconButton} alt="Logout" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileSidebarDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}

export default CmsNavbar;
