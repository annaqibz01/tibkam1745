// src/layouts/DashboardLayout/components/Sidebar.tsx
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { getAvatarUrl } from "@/features/users";
import type { UsersResponse, UsersRoleOptions } from "../../../types/pocketbase-types";
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Scissors,
  Users,
  Database,
  CalendarDays,
  ShieldCheck,
  FileText,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: UsersRoleOptions[];
}

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<{ title: string; top: number } | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, logout } = useAuth();
  const currentUser = user as UsersResponse | null;

  const menuItems: NavItem[] = [
    { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, allowedRoles: ["admin", "admin_rambut", "umum", "rambut"] },
    { title: "Kelola Pengguna", path: "/users", icon: Users, allowedRoles: ["admin", "admin_rambut"] },
    { title: "Personil Tibkam", path: "/personil", icon: ShieldCheck, allowedRoles: ["admin", "admin_rambut"] },
    { title: "Data Master", path: "/master", icon: Database, allowedRoles: ["admin", "admin_rambut", "umum", "rambut"] },
    { title: "Layanan Rambut", path: "/rambut", icon: Scissors, allowedRoles: ["admin", "admin_rambut", "rambut"] },
    { title: "Laporan", path: "/laporan", icon: FileText, allowedRoles: ["admin", "admin_rambut", "rambut"] },
    { title: "Kalender", path: "/kalender", icon: CalendarDays, allowedRoles: ["admin", "admin_rambut", "rambut"] },
    { title: "Profil Saya", path: "/profile", icon: User, allowedRoles: ["admin", "admin_rambut", "umum", "rambut"] },
  ];

  const filteredMenu = currentUser
    ? menuItems.filter((item) => item.allowedRoles.includes(currentUser.role as UsersRoleOptions))
    : [];

  const nameInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : currentUser?.username
      ? currentUser.username.charAt(0).toUpperCase()
      : "?";

  const getRoleBadgeClass = () => {
    switch (currentUser?.role) {
      case "admin":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "rambut":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "umum":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const closeMobile = () => setIsMobileOpen(false);
  const handleLogout = () => logout();

  const avatarImage = getAvatarUrl(currentUser);

  const showTooltip = (title: string, top: number) => {
    setHoveredItem({ title, top });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, title: string) => {
    if (window.innerWidth < 1024) return;

    const iconEl = e.currentTarget.querySelector("svg");
    const rect = iconEl
      ? iconEl.getBoundingClientRect()
      : e.currentTarget.getBoundingClientRect();
    const top = rect.top + rect.height / 2;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      showTooltip(title, top);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredItem(null);
  };

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
        aria-label="Buka menu navigasi"
      >
        <Menu className="w-4 h-4 text-indigo-400" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/80 transition-opacity"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar desktop (always collapsed) + mobile full */}
      <aside
        className={`
          fixed top-9 lg:top-0 left-0 z-50 h-[calc(100vh-36px)] lg:h-full
          w-60 lg:w-16 overflow-visible bg-zinc-900 border-r border-zinc-800
          flex flex-col select-none
          transition-transform duration-200 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header mobile: hanya tombol close */}
        <div className="lg:hidden flex items-center justify-end px-2 h-12 border-b border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={closeMobile}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Card */}
        {currentUser && (
          <div className="p-2 border-b border-zinc-800 shrink-0">
            <div className="flex items-center rounded-lg bg-zinc-950/60 border border-zinc-800/80 p-1.5 lg:p-0 lg:justify-center lg:border-transparent lg:bg-transparent">
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt={currentUser.name ?? "User"}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-base border border-zinc-700">
                    {nameInitial}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
              </div>

              <div className="min-w-0 ml-2.5 lg:hidden">
                <p className="text-xs font-medium text-zinc-200 truncate leading-tight font-sans">
                  {currentUser.name || currentUser.username}
                </p>
                <span
                  className={`inline-block mt-0.5 text-[9px] font-mono font-medium px-1.5 py-0.2 rounded border uppercase leading-none ${getRoleBadgeClass()}`}
                >
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                onMouseEnter={(e) => handleMouseEnter(e, item.title)}
                onMouseLeave={handleMouseLeave}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center h-9 rounded-lg text-xs font-sans transition-colors duration-150 w-full",
                    "justify-start px-2.5 lg:justify-center lg:px-0",
                    isActive
                      ? "bg-zinc-800 text-white font-semibold border border-zinc-700/60"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border border-transparent",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200"
                      }`}
                    />
                    <span className="ml-2.5 truncate lg:hidden">{item.title}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-zinc-800 mt-auto shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={(e) => handleMouseEnter(e, "Keluar Sesi")}
            onMouseLeave={handleMouseLeave}
            className="group relative flex items-center h-9 rounded-lg text-xs font-sans font-medium transition-colors w-full px-2.5 lg:px-0 lg:justify-center text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5 shrink-0 text-zinc-400 group-hover:text-rose-400" />
            <span className="ml-2.5 lg:hidden">Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Tooltip portal dengan delay & animasi */}
      {hoveredItem &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              left: "72px",
              top: hoveredItem.top,
              transform: "translateY(-50%)",
            }}
          >
            <div
              className="flex items-center"
              style={{ animation: "tooltipFadeSlide 0.25s cubic-bezier(0.22, 0.61, 0.36, 1)" }}
            >
              <div className="w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-zinc-800" />
              <div className="ml-[-1px] px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-100 text-xs font-medium whitespace-nowrap shadow-xl border border-zinc-700">
                {hoveredItem.title}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Sidebar;