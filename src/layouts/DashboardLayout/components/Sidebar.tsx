// src/layouts/DashboardLayout/components/Sidebar.tsx
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth";
import { getAvatarUrl } from "@/features/users";
import type {
  UsersResponse,
  UsersRoleOptions,
} from "../../../types/pocketbase-types";
import {
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  Scissors,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  Sparkles,
  CalendarDays,
  FileText,
  type LucideIcon,
} from "lucide-react";

// ----------------------------------------------------------------------
// Type definitions
// ----------------------------------------------------------------------
interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: UsersRoleOptions[];
}

// ----------------------------------------------------------------------
// Sidebar Component
// ----------------------------------------------------------------------
const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Initial collapsed state from localStorage (or false)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("sidebar-collapsed");
      if (stored !== null) return JSON.parse(stored);
    } catch {}
    return false;
  });

  const { user, logout } = useAuth();
  const currentUser = user as UsersResponse | null;

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // ---- Menu item definitions ----
  const menuItems: NavItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      allowedRoles: ["admin", "admin_rambut", "umum", "rambut"],
    },
    {
      title: "Kelola Pengguna",
      path: "/users",
      icon: Users,
      allowedRoles: ["admin", "admin_rambut"],
    },
    {
      title: "Data Master",
      path: "/master",
      icon: Database,
      allowedRoles: ["admin", "admin_rambut", "umum", "rambut"],
    },
    {
      title: "Layanan Rambut",
      path: "/rambut",
      icon: Scissors,
      allowedRoles: ["admin", "admin_rambut", "rambut"],
    },
    {
      title: "Laporan Rambut",
      path: "/laporan/rambut",
      icon: FileText,
      allowedRoles: ["admin", "admin_rambut", "rambut"],
    },
    {
      title: "Kalender",
      path: "/kalender",
      icon: CalendarDays,
      allowedRoles: ["admin", "admin_rambut", "rambut"],
    },
    {
      title: "Profil Saya",
      path: "/profile",
      icon: User,
      allowedRoles: ["admin", "admin_rambut", "umum", "rambut"],
    },
  ];

  // Filter menu berdasarkan role user
  const filteredMenu = currentUser
    ? menuItems.filter((item) =>
        item.allowedRoles.includes(currentUser.role as UsersRoleOptions),
      )
    : [];

  // ---- Avatar / Name handling ----
  const nameInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : currentUser?.username
      ? currentUser.username.charAt(0).toUpperCase()
      : "?";

  const getRoleBadgeClass = () => {
    switch (currentUser?.role) {
      case "admin":
        return "bg-purple-500/10 text-purple-300 border-purple-500/20";
      case "rambut":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
      case "umum":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);
  const handleLogout = () => logout();

  const avatarImage = getAvatarUrl(currentUser);

  // --------------------------------------------------------------------
  // JSX
  // --------------------------------------------------------------------
  return (
    <>
      {/* 📱 Mobile Menu Trigger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-2xl bg-gray-900/90 border border-gray-800/80 text-gray-300 hover:text-white hover:bg-gray-800 backdrop-blur-xl shadow-xl transition-all duration-200 active:scale-95"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-indigo-400" />
      </button>

      {/* 🛡️ Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-950/80 backdrop-blur-md transition-opacity duration-300"
          onClick={closeMobile}
        />
      )}

      {/* 🚀 ---- Sidebar Desktop & Mobile ---- */}
      <aside
        className={`
    fixed top-9 lg:top-0 left-0 z-50 h-[calc(100vh-36px)] lg:h-full overflow-hidden
    bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 backdrop-blur-2xl
    border-r border-gray-800/80 shadow-2xl
    flex flex-col transform-gpu
    transition-[width,transform] duration-300 ease-in-out
    lg:translate-x-0 lg:static lg:z-auto
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    ${isCollapsed ? "w-20" : "w-64"}
  `}
      >
        {/* 🔮 Garis Kilau Top-Border */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />

        {/* 🔮 Ambient Glow Mesh */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-indigo-600/10 blur-[60px] pointer-events-none" />

        {/* ----- Top Section: Header, Profile & Navigation ----- */}
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          {/* 1. Header Logo Area (Tinggi Terkunci Presisi h-[73px]) */}
          <div className="flex items-center justify-between px-3 h-[73px] border-b border-gray-800/80 flex-shrink-0 overflow-hidden">
            {/* Logo Brand Title */}
            <div
              className={`flex items-center gap-2.5 overflow-hidden transition-all duration-300 ease-in-out ${
                isCollapsed
                  ? "max-w-0 opacity-0"
                  : "max-w-[200px] opacity-100 pl-1"
              }`}
            >
              {/* Logo Sayap Saja menggantikan box Sparkles lama */}
              <img
                src="logo_tibkam_sayap_saja.svg"
                alt="Logo Tibkam"
                className="h-7 w-auto flex-shrink-0 object-contain"
              />

              <div className="min-w-0">
                <h2 className="text-base font-extrabold tracking-wider text-white whitespace-nowrap font-mono leading-none">
                  TIBKAM<span className="text-indigo-400">1745</span>
                </h2>
                <p className="text-[10px] font-mono text-gray-500 mt-1 truncate leading-none">
                  System Portal
                </p>
              </div>
            </div>

            {/* Desktop Toggle Button */}
            <button
              type="button"
              onClick={toggleCollapse}
              className={`hidden lg:inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 border border-transparent hover:border-gray-700/60 transition-all duration-200 active:scale-95 flex-shrink-0 ${
                isCollapsed ? "mx-auto" : "ml-auto"
              }`}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-indigo-400" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeMobile}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-colors flex-shrink-0 ml-auto"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. User Profile Card (✨ TINGGI TERKUNCI PRESISE h-[76px] - NUL LAYOUT SHIFT) */}
          {currentUser && (
            <div className="px-3 h-[76px] border-b border-gray-800/80 flex-shrink-0 flex items-center">
              <div
                className={`flex items-center w-full h-[52px] rounded-2xl px-2.5 border transition-colors duration-200 ${
                  isCollapsed
                    ? "bg-transparent border-transparent shadow-none"
                    : "bg-gray-950/40 border-gray-800/60 shadow-sm"
                }`}
              >
                {/* Avatar Box (Presisi Center X = 38px Terkunci Garis Vertikal) */}
                <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center">
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt={currentUser.name ?? "User"}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 border border-gray-700 shadow-md"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-950 to-gray-800 flex items-center justify-center text-indigo-300 font-mono font-bold text-sm ring-2 ring-indigo-500/20 border border-indigo-500/30 shadow-md">
                      {nameInitial}
                    </div>
                  )}
                  {/* Status Indicator */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-gray-900 animate-pulse" />
                </div>

                {/* User Details */}
                <div
                  className={`min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${
                    isCollapsed
                      ? "max-w-0 opacity-0 pointer-events-none ml-0"
                      : "max-w-[180px] opacity-100 ml-3"
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-200 truncate whitespace-nowrap leading-tight">
                    {currentUser.name || currentUser.username}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border uppercase whitespace-nowrap leading-none ${getRoleBadgeClass()}`}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Navigation Links List */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 custom-scrollbar">
            {filteredMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  title={isCollapsed ? item.title : undefined}
                  className={({ isActive: isLinkActive }) =>
                    [
                      "group relative flex items-center h-11 px-2 rounded-2xl text-xs font-medium transition-colors duration-200 w-full select-none",
                      isLinkActive
                        ? "text-indigo-300 font-semibold shadow-sm"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200",
                    ].join(" ")
                  }
                >
                  {({ isActive: isLinkActive }) => (
                    <>
                      {/* Background & Garis Aksen Meluncur Satu Paket */}
                      {isLinkActive && (
                        <motion.div
                          layoutId="sidebarActiveIndicator"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent border-l-2 border-indigo-400 pointer-events-none"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}

                      {/* Icon Box (Center X = 38px Terkunci Garis Vertikal) */}
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 relative z-10">
                        <Icon
                          className={`w-5 h-5 transition-colors duration-200 ${
                            isLinkActive
                              ? "text-indigo-400"
                              : "text-gray-400 group-hover:text-gray-200"
                          }`}
                        />
                      </div>

                      {/* Navigation Title */}
                      <span
                        className={`relative z-10 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                          isCollapsed
                            ? "max-w-0 opacity-0 pointer-events-none ml-0"
                            : "max-w-[180px] opacity-100 ml-3"
                        }`}
                      >
                        {item.title}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* ----- Bottom Section: Logout Button ----- */}
        <div className="relative z-10 px-3 py-3 h-[65px] border-t border-gray-800/80 mt-auto flex-shrink-0 flex items-center">
          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Keluar Sesi" : undefined}
            className="group w-full flex items-center h-11 px-2 rounded-2xl text-xs font-mono font-semibold text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 active:scale-95 transition-all duration-200 select-none"
          >
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
            </div>
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                isCollapsed
                  ? "max-w-0 opacity-0 pointer-events-none ml-0"
                  : "max-w-[180px] opacity-100 ml-3"
              }`}
            >
              Keluar Sesi
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
