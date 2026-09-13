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
    <div className="space-y-2 select-none font-sans">
      {/* Search Input Universal (Tinggi h-9) */}
      <BaseToolbar
        search={search}
        onSearchChange={onSearchChange}
        placeholder="Cari nama, ID PPS, atau jabatan personil..."
        onRefresh={onRefresh}
        isLoading={isListLoading}
        searchIconColorClass="text-zinc-500"
      />

      {/* Grid Filter Dropdown 3 Kolom (Tinggi h-9, Palet Netral Zinc) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
        <GlassDropdown
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val as "all" | "aktif" | "nonaktif")}
          options={statusDropdownOptions}
          defaultLabel="Semua Status"
          icon={<Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
          activeColorClass="border-zinc-700 bg-zinc-800 text-white"
          minWidthClass="w-full"
          searchable={false}
        />

        <GlassDropdown
          value={jabatanFilter}
          onChange={onJabatanFilterChange}
          options={jabatanDropdownOptions}
          defaultLabel="Semua Jabatan"
          icon={<ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
          activeColorClass="border-zinc-700 bg-zinc-800 text-white"
          minWidthClass="w-full"
          searchPlaceholder="Cari jabatan..."
        />

        <GlassDropdown
          value={domisiliFilter}
          onChange={onDomisiliFilterChange}
          options={domisiliDropdownOptions}
          defaultLabel="Semua Kompleks"
          icon={<Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
          activeColorClass="border-zinc-700 bg-zinc-800 text-white"
          minWidthClass="w-full"
          searchPlaceholder="Cari kompleks..."
        />
      </div>
    </div>
  );
}