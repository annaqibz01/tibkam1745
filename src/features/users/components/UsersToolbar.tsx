// src/features/users/components/UsersToolbar.tsx
import React from "react";
import { Shield, Activity, Lock } from "lucide-react";
import { BaseToolbar, GlassDropdown, type DropdownOption } from "@/components/shared";
import { ROLE_FILTER_OPTIONS, STATUS_OPTIONS } from "@/utils/userHelpers";

interface UsersToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isAdminRambut?: boolean;
}

export const UsersToolbar: React.FC<UsersToolbarProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  isLoading,
  isAdminRambut = false,
}) => {
  const roleOptions: DropdownOption[] = ROLE_FILTER_OPTIONS.map((r) => ({
    value: r,
    label: r === "Semua Role" ? r : `Role: ${r}`,
  }));

  const statusOptions: DropdownOption[] = STATUS_OPTIONS.map((s) => ({
    value: s,
    label: s === "Semua Status" ? s : `Status: ${s}`,
  }));

  return (
    <BaseToolbar
      search={searchTerm}
      onSearchChange={onSearchChange}
      placeholder="Cari nama atau username pengguna..."
      onRefresh={onRefresh}
      isLoading={isLoading}
      searchIconColorClass="text-indigo-400"
    >
      {/* Dropdown Filter Role */}
      <GlassDropdown
        value={isAdminRambut ? "rambut" : roleFilter}
        onChange={onRoleFilterChange}
        options={roleOptions}
        defaultLabel="Semua Role"
        icon={
          isAdminRambut ? (
            <Lock className="w-4 h-4 text-amber-400" />
          ) : (
            <Shield className="w-4 h-4 text-indigo-400" />
          )
        }
        activeColorClass="border-indigo-500/60 text-indigo-200 ring-indigo-500/20"
        minWidthClass="min-w-[180px]"
        disabled={isAdminRambut}
      />

      {/* Dropdown Filter Status */}
      <GlassDropdown
        value={statusFilter}
        onChange={onStatusFilterChange}
        options={statusOptions}
        defaultLabel="Semua Status"
        icon={<Activity className="w-4 h-4 text-emerald-400" />}
        activeColorClass="border-emerald-500/60 text-emerald-200 ring-emerald-500/20"
        minWidthClass="min-w-[180px]"
      />
    </BaseToolbar>
  );
};