import React from "react";
import { Link, useLocation } from "react-router-dom";
import Edit from "@shared/assets/images/mascot-icons/Edit.png";
import ArrowRight from "@shared/assets/images/mascot-icons/Arrow - Right 3.png";
import IconAddUser from "@shared/assets/images/mascot-icons/Add User.png";
import IconMedia from "@shared/assets/images/mascot-icons/Image 3.png";
import LoadingModal from "@shared/ui/LoadingModal";
import {
  FiTrendingUp,
  FiBell,
  FiCalendar,
  FiShield,
  FiBookOpen,
  FiFileText,
  FiClipboard,
  FiDollarSign,
  FiActivity,
  FiAward,
  FiClock,
  FiUsers,
  FiCheckSquare,
} from "react-icons/fi";
import { useAdmin } from "@shared/context/AdminContext";

export interface SidebarProps {
  onNavigate?: () => void;
  className?: string;
}

interface MenuItem {
  id: string;
  label: string;
  to: string;
  icon: React.ReactNode | string;
  condition: boolean | string | null | undefined;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

function Sidebar({ onNavigate, className }: SidebarProps = {}) {
  const { dataAdmin, loading } = useAdmin();
  const location = useLocation();

  if (loading) {
    return <LoadingModal isLoading={true} message="Authenticating..." />;
  }

  const sections: MenuSection[] = [
    {
      title: "General",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          to: "/cms/dashboard",
          icon: <FiTrendingUp className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "kelola-akun",
          label: "Kelola Akun",
          to: "/cms/kelolaakun",
          icon: IconAddUser,
          condition: dataAdmin && dataAdmin.role !== "admin",
        },
        {
          id: "media-library",
          label: "Media Library",
          to: "/cms/media",
          icon: IconMedia,
          condition: true,
        },
      ],
    },
    {
      title: "Company Profile",
      items: [
        {
          id: "talent-academy",
          label: "Talent Academy",
          to: "/cms/talentacademy",
          icon: ArrowRight,
          condition: true,
        },
        {
          id: "mentor-academy",
          label: "Mentor Academy",
          to: "/cms/mentoracademy",
          icon: ArrowRight,
          condition: true,
        },
        {
          id: "parents-academy",
          label: "Parents Academy",
          to: "/cms/parentsacademy",
          icon: ArrowRight,
          condition: true,
        },
        {
          id: "article",
          label: "Article",
          to: "/cms/article",
          icon: Edit,
          condition: true,
        },
        {
          id: "event-management",
          label: "Events",
          to: "/cms/events",
          icon: <FiCalendar className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "popup-management",
          label: "Popup",
          to: "/cms/popup",
          icon: <FiBell className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
      ],
    },
    {
      title: "Portal Mentor",
      items: [
        {
          id: "review-queue",
          label: "Antrian Review",
          to: "/cms/review-queue",
          icon: <FiShield className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "programs",
          label: "Program",
          to: "/cms/programs",
          icon: <FiBookOpen className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "materials",
          label: "Materi",
          to: "/cms/materials",
          icon: <FiFileText className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "assignments",
          label: "Tugas",
          to: "/cms/assignments",
          icon: <FiClipboard className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "assessments",
          label: "Kelulusan MAN",
          to: "/cms/assessments",
          icon: <FiAward className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "attendance",
          label: "Absensi OTP",
          to: "/cms/attendance",
          icon: <FiClock className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "contributors",
          label: "Kontributor & Poin",
          to: "/cms/contributors",
          icon: <FiUsers className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "article-reviews",
          label: "Review Artikel",
          to: "/cms/article-reviews",
          icon: <FiCheckSquare className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "exclusive-articles",
          label: "Artikel Eksklusif",
          to: "/cms/article?filter=exclusive",
          icon: Edit,
          condition: true,
        },
        {
          id: "qris-settings",
          label: "Pengaturan QRIS",
          to: "/cms/settings/qris",
          icon: <FiDollarSign className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
        {
          id: "audit-logs",
          label: "Audit Log Akses",
          to: "/cms/audit-logs",
          icon: <FiActivity className="w-6 h-6 text-neutral-dark" />,
          condition: true,
        },
      ],
    },
  ];

  const isItemActive = (to: string) => {
    if (to === "/cms/article?filter=exclusive") {
      return location.pathname === "/cms/article" && location.search.includes("filter=exclusive");
    }
    if (to === "/cms/article") {
      return location.pathname === "/cms/article" && !location.search.includes("filter=exclusive");
    }
    if (to === "/cms/dashboard") {
      return location.pathname === "/cms/dashboard" || location.pathname === "/cms/dashboard/";
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <div
      className={`py-4 px-3 w-72 h-auto flex flex-col justify-start rounded-xl bg-neutral-white ${className || ""
        }`}
    >
      <div className="w-full space-y-4">
        {sections.map((section) => {
          const visibleItems = section.items.filter((item) => Boolean(item.condition));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="w-full">
              {/* Section Header */}
              <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-gray-400 select-none">
                {section.title}
              </div>

              {/* Indented Item List */}
              <ul className="pl-2 space-y-1">
                {visibleItems.map((menu) => {
                  const isReactIcon = React.isValidElement(menu.icon);
                  const iconComponent = isReactIcon ? (
                    menu.icon
                  ) : (
                    <img className="w-6" src={menu.icon as string} alt={menu.label} />
                  );

                  const active = isItemActive(menu.to);

                  return (
                    <li
                      key={menu.id}
                      className={`w-full rounded-xl transition-colors ${active
                        ? "bg-background font-bold text-primary-1"
                        : "hover:bg-background text-neutral-dark"
                        }`}
                    >
                      <Link
                        className="flex gap-3.5 items-center py-2.5 px-3"
                        to={menu.to}
                        onClick={() => {
                          if (onNavigate) onNavigate();
                        }}
                      >
                        <span className="shrink-0">{iconComponent}</span>
                        <p
                          className={`text-base truncate ${active ? "font-bold text-primary-1" : "font-semibold"
                            }`}
                        >
                          {menu.label}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
