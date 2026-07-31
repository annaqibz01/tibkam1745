// src/features/users/components/UsersToolbar.tsx
import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X, Shield, Activity, Lock } from "lucide-react";
import { ROLE_FILTER_OPTIONS, STATUS_OPTIONS } from "@/utils/userHelpers";

interface UsersToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  isAdminRambut?: boolean;
}

export const UsersToolbar: React.FC<UsersToolbarProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  isAdminRambut = false,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const roleRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isRoleActive = roleFilter !== "Semua Role";
  const isStatusActive = statusFilter !== "Semua Status";

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* 1. Input Pencarian */}
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <input
          type="text"
          placeholder="Cari nama atau username pengguna..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 shadow-lg transition-all duration-200"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300 transition-colors"
            title="Bersihkan pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Grup Filter Dropdown */}
      <div className="flex items-center gap-3">
        {/* Dropdown: Role Filter */}
        <div ref={roleRef} className="relative flex-1 sm:flex-initial">
          {isAdminRambut ? (
            <div className="w-full sm:w-44 flex items-center justify-between px-4 py-3 bg-gray-900/40 border border-amber-500/30 rounded-2xl text-sm text-amber-300 font-mono shadow-lg select-none cursor-not-allowed">
              <div className="flex items-center gap-2 truncate">
                <Shield className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span className="capitalize truncate font-bold">rambut</span>
              </div>
              <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 ml-1" />
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsRoleDropdownOpen(!isRoleDropdownOpen);
                  setIsStatusDropdownOpen(false);
                }}
                className={`w-full sm:w-44 flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-xl border rounded-2xl text-sm transition-all duration-200 shadow-lg ${
                  isRoleDropdownOpen || isRoleActive
                    ? "border-indigo-500/50 text-white ring-2 ring-indigo-500/20"
                    : "border-gray-800/80 text-gray-300 hover:border-gray-700 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Shield
                    className={`w-4 h-4 flex-shrink-0 ${
                      isRoleActive ? "text-indigo-400" : "text-gray-500"
                    }`}
                  />
                  <span className="capitalize truncate font-medium">{roleFilter}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-2">
                  {isRoleActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      isRoleDropdownOpen ? "rotate-180 text-indigo-400" : ""
                    }`}
                  />
                </div>
              </button>

              {isRoleDropdownOpen && (
                <ul className="absolute right-0 z-30 mt-2 w-full sm:w-48 bg-gray-900/95 backdrop-blur-2xl border border-gray-800/90 rounded-2xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800/60 mb-1">
                    Filter Role
                  </div>
                  {ROLE_FILTER_OPTIONS.map((r) => (
                    <li
                      key={r}
                      onClick={() => {
                        onRoleFilterChange(r);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-4 py-2.5 text-xs font-medium cursor-pointer capitalize transition-colors ${
                        roleFilter === r
                          ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                          : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                      }`}
                    >
                      <span>{r}</span>
                      {roleFilter === r && <Check className="w-4 h-4 text-indigo-400" />}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Dropdown: Status Filter */}
        <div ref={statusRef} className="relative flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={() => {
              setIsStatusDropdownOpen(!isStatusDropdownOpen);
              setIsRoleDropdownOpen(false);
            }}
            className={`w-full sm:w-44 flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-xl border rounded-2xl text-sm transition-all duration-200 shadow-lg ${
              isStatusDropdownOpen || isStatusActive
                ? "border-indigo-500/50 text-white ring-2 ring-indigo-500/20"
                : "border-gray-800/80 text-gray-300 hover:border-gray-700 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Activity
                className={`w-4 h-4 flex-shrink-0 ${
                  isStatusActive ? "text-indigo-400" : "text-gray-500"
                }`}
              />
              <span className="truncate font-medium">{statusFilter}</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              {isStatusActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              )}
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                  isStatusDropdownOpen ? "rotate-180 text-indigo-400" : ""
                }`}
              />
            </div>
          </button>

          {isStatusDropdownOpen && (
            <ul className="absolute right-0 z-30 mt-2 w-full sm:w-48 bg-gray-900/95 backdrop-blur-2xl border border-gray-800/90 rounded-2xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800/60 mb-1">
                Filter Status
              </div>
              {STATUS_OPTIONS.map((s) => (
                <li
                  key={s}
                  onClick={() => {
                    onStatusFilterChange(s);
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                    statusFilter === s
                      ? "bg-indigo-600/15 text-indigo-400 font-semibold"
                      : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                  }`}
                >
                  <span>{s}</span>
                  {statusFilter === s && <Check className="w-4 h-4 text-indigo-400" />}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};