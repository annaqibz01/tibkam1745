// src/utils/userHelpers.ts
import type { UsersRoleOptions } from "../types/pocketbase-types";

export const ROLE_OPTIONS: UsersRoleOptions[] = ["admin", "admin_rambut", "rambut", "umum"];
export const STATUS_OPTIONS = ["Semua Status", "Aktif", "Nonaktif"];
export const ROLE_FILTER_OPTIONS = ["Semua Role", "admin", "admin_rambut", "rambut", "umum"];

export const roleBadgeClass = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-purple-600/20 text-purple-300 border-purple-500/40";
    case "admin_rambut":
      return "bg-amber-600/20 text-amber-300 border-amber-500/40";
    case "rambut":
      return "bg-blue-600/20 text-blue-300 border-blue-500/40";
    case "umum":
      return "bg-gray-600/20 text-gray-300 border-gray-500/40";
    default:
      return "bg-gray-600/20 text-gray-400 border-gray-500/40";
  }
};

/**
 * Parser angka murni dari string ID PPS untuk keperluan pengurutan numerik global
 */
export const parseNumericIdPps = (val?: string | number | null): number => {
  if (!val) return 0;
  const digits = String(val).replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
};

export interface SantriAddressEntity {
  desa?: string | null;
  kecamatan?: string | null;
  kabupaten?: string | null;
  provinsi?: string | null;
}

/**
 * Format universal alamat santri (Desa, Kecamatan, Kabupaten)
 */
export const getAlamatStr = (santri?: SantriAddressEntity | null): string => {
  if (!santri) return "-";
  const parts = [santri.desa, santri.kecamatan, santri.kabupaten]
    .map((v) => v?.toString().trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
};