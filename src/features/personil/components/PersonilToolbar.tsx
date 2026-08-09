// src/features/personil/components/PersonilToolbar.tsx
import React, { useMemo } from "react";
import { Filter, Building, ShieldCheck } from "lucide-react";
import { BaseToolbar, GlassDropdown, type DropdownOption } from "@/components/shared";

interface PersonilToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: "all" | "aktif" | "nonaktif";
  onStatusFilterChange: (val: "all" | "aktif" | "nonaktif") => void;
  jabatanFilter: string;
  onJabatanFilterChange: (val: string) => void;
  domisiliFilter: string;
  onDomisiliFilterChange: (val: string) => void;
  jabatanOptions?: string[];
  domisiliOptions?: string[];
  onRefresh: () => void;
  isListLoading: boolean;
}

export default function PersonilToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  jabatanFilter,
  onJabatanFilterChange,
  domisiliFilter,
  onDomisiliFilterChange,
  jabatanOptions = [],
  domisiliOptions = [],
  onRefresh,
  isListLoading,
}: PersonilToolbarProps) {
  const statusDropdownOptions: DropdownOption[] = [
    { value: "all", label: "Semua Status" },
    { value: "aktif", label: "Aktif" },
    { value: "nonaktif", label: "Nonaktif" },
  ];

  const jabatanDropdownOptions: DropdownOption[] = useMemo(
    () => [
      { value: "all", label: "Semua Jabatan" },
      ...jabatanOptions.map((j) => ({ value: j, label: j })),
    ],
    [jabatanOptions]
  );

  const domisiliDropdownOptions: DropdownOption[] = useMemo(
    () => [
      { value: "all", label: "Semua Kompleks" },
      ...domisiliOptions.map((d) => ({ value: d, label: d })),
    ],
    [domisiliOptions]
  );

  return (
    <div className="mb-5 space-y-3 select-none">
      {/* Search Input Universal */}
      <BaseToolbar
        search={search}
        onSearchChange={onSearchChange}
        placeholder="Cari nama, ID PPS, atau jabatan personil..."
        onRefresh={onRefresh}
        isLoading={isListLoading}
        searchIconColorClass="text-indigo-400"
      />

      {/* Grid Filter Dropdown dengan Gaya Aktif Halus (Bebas Ring Mencolok) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full font-mono">
        {/* 1. Status Aktif */}
        <GlassDropdown
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val as "all" | "aktif" | "nonaktif")}
          options={statusDropdownOptions}
          defaultLabel="Semua Status"
          icon={<Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
          activeColorClass="border-indigo-500/40 text-indigo-200 bg-indigo-500/10"
          minWidthClass="w-full"
          searchable={false}
        />

        {/* 2. Jabatan Tibkam */}
        <GlassDropdown
          value={jabatanFilter}
          onChange={onJabatanFilterChange}
          options={jabatanDropdownOptions}
          defaultLabel="Semua Jabatan"
          icon={<ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
          activeColorClass="border-sky-500/40 text-sky-200 bg-sky-500/10"
          minWidthClass="w-full"
          searchPlaceholder="Cari jabatan..."
        />

        {/* 3. Kompleks Domisili */}
        <GlassDropdown
          value={domisiliFilter}
          onChange={onDomisiliFilterChange}
          options={domisiliDropdownOptions}
          defaultLabel="Semua Kompleks"
          icon={<Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          activeColorClass="border-amber-500/40 text-amber-200 bg-amber-500/10"
          minWidthClass="w-full"
          searchPlaceholder="Cari kompleks..."
        />
      </div>
    </div>
  );
}