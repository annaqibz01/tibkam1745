// src/features/master/components/MasterToolbar.tsx
import React, { useMemo } from "react";
import { Filter, GraduationCap, BookOpen, Home, Building } from "lucide-react";
import { BaseToolbar, GlassDropdown, type DropdownOption } from "@/components/shared";

interface MasterToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: "all" | "aktif" | "nonaktif";
  onStatusFilterChange: (val: "all" | "aktif" | "nonaktif") => void;
  tingkatanFilter: string;
  onTingkatanFilterChange: (val: string) => void;
  kelasFilter: string;
  onKelasFilterChange: (val: string) => void;
  statusDomisiliFilter: string;
  onStatusDomisiliFilterChange: (val: string) => void;
  domisiliFilter: string;
  onDomisiliFilterChange: (val: string) => void;
  tingkatanOptions?: string[];
  kelasOptions?: string[];
  statusDomisiliOptions?: string[];
  domisiliOptions?: string[];
  onRefresh: () => void;
  isListLoading: boolean;
}

export default function MasterToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tingkatanFilter,
  onTingkatanFilterChange,
  kelasFilter,
  onKelasFilterChange,
  statusDomisiliFilter,
  onStatusDomisiliFilterChange,
  domisiliFilter,
  onDomisiliFilterChange,
  tingkatanOptions = [],
  kelasOptions = [],
  statusDomisiliOptions = [],
  domisiliOptions = [],
  onRefresh,
  isListLoading,
}: MasterToolbarProps) {
  const statusDropdownOptions: DropdownOption[] = [
    { value: "all", label: "Semua Status" },
    { value: "aktif", label: "Aktif" },
    { value: "nonaktif", label: "Nonaktif" },
  ];

  const tingkatanDropdownOptions: DropdownOption[] = useMemo(
    () => [
      { value: "all", label: "Semua Tingkatan" },
      ...tingkatanOptions.map((t) => ({ value: t, label: t })),
    ],
    [tingkatanOptions]
  );

  const kelasDropdownOptions: DropdownOption[] = useMemo(
    () => [
      { value: "all", label: "Semua Kelas" },
      ...kelasOptions.map((k) => ({ value: k, label: k })),
    ],
    [kelasOptions]
  );

  const statusDomisiliDropdownOptions: DropdownOption[] = useMemo(
    () => [
      { value: "all", label: "Semua Status Domisili" },
      ...statusDomisiliOptions.map((s) => ({ value: s, label: s })),
    ],
    [statusDomisiliOptions]
  );

  const domisiliDropdownOptions: DropdownOption[] = useMemo(
    () => [
      { value: "all", label: "Semua Domisili" },
      ...domisiliOptions.map((d) => ({ value: d, label: d })),
    ],
    [domisiliOptions]
  );

  return (
    <div className="space-y-2 select-none font-sans">
      {/* Search Bar & Tombol Refresh (Tinggi h-9) */}
      <BaseToolbar
        search={search}
        onSearchChange={onSearchChange}
        placeholder="Cari nama atau ID PPS santri..."
        onRefresh={onRefresh}
        isLoading={isListLoading}
        searchIconColorClass="text-zinc-500"
      />

      {/* Grid Filter Dropdown 5 Kolom (Tinggi h-9, Palet Netral Zinc) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
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
          value={tingkatanFilter}
          onChange={onTingkatanFilterChange}
          options={tingkatanDropdownOptions}
          defaultLabel="Semua Tingkatan"
          icon={<GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
          activeColorClass="border-zinc-700 bg-zinc-800 text-white"
          minWidthClass="w-full"
          searchPlaceholder="Cari tingkatan..."
        />

        <GlassDropdown
          value={kelasFilter}
          onChange={onKelasFilterChange}
          options={kelasDropdownOptions}
          defaultLabel="Semua Kelas"
          icon={<BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
          activeColorClass="border-zinc-700 bg-zinc-800 text-white"
          minWidthClass="w-full"
          searchPlaceholder="Cari kelas..."
        />

        <GlassDropdown
          value={statusDomisiliFilter}
          onChange={onStatusDomisiliFilterChange}
          options={statusDomisiliDropdownOptions}
          defaultLabel="Semua Status Domisili"
          icon={<Home className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
          activeColorClass="border-zinc-700 bg-zinc-800 text-white"
          minWidthClass="w-full"
          searchPlaceholder="Cari status domisili..."
        />

        <GlassDropdown
          value={domisiliFilter}
          onChange={onDomisiliFilterChange}
          options={domisiliDropdownOptions}
          defaultLabel="Semua Domisili"
          icon={<Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
          activeColorClass="border-zinc-700 bg-zinc-800 text-white"
          minWidthClass="w-full"
          searchPlaceholder="Cari domisili..."
        />
      </div>
    </div>
  );
}