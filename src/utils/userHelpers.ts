// src/utils/userHelpers.ts
import type { UsersRoleOptions } from "../types/pocketbase-types";

export const ROLE_OPTIONS: UsersRoleOptions[] = ["admin", "rambut", "umum"];
export const STATUS_OPTIONS = ["Semua Status", "Aktif", "Nonaktif"];
export const ROLE_FILTER_OPTIONS = ["Semua Role", "admin", "rambut", "umum"];

export const roleBadgeClass = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-purple-600/20 text-purple-300 border-purple-500/40";
    case "rambut":
      return "bg-blue-600/20 text-blue-300 border-blue-500/40";
    case "umum":
      return "bg-gray-600/20 text-gray-300 border-gray-500/40";
    default:
      return "bg-gray-600/20 text-gray-400 border-gray-500/40";
  }
};