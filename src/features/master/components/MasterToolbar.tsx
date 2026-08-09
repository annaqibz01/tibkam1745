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
    <div className="mb-5 space-y-3 select-none">
      {/* Search Input & Refresh Button */}
      <BaseToolbar
        search={search}
        onSearchChange={onSearchChange}
        placeholder="Cari nama atau ID PPS santri (Tekan Enter)..."
        onRefresh={onRefresh}
        isLoading={isListLoading}
        searchIconColorClass="text-indigo-400"
      />

      {/* Grid Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full font-mono">
        {/* 1. Status Aktif */}
        <GlassDropdown
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val as "all" | "aktif" | "nonaktif")}
          options={statusDropdownOptions}
          defaultLabel="Semua Status"
          icon={<Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
          activeColorClass="border-indigo-500/50 text-indigo-300 ring-indigo-500/20"
          minWidthClass="w-full"
          searchable={false}
        />

        {/* 2. Tingkatan */}
        <GlassDropdown
          value={tingkatanFilter}
          onChange={onTingkatanFilterChange}
          options={tingkatanDropdownOptions}
          defaultLabel="Semua Tingkatan"
          icon={<GraduationCap className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
          activeColorClass="border-purple-500/50 text-purple-300 ring-purple-500/20"
          minWidthClass="w-full"
          searchPlaceholder="Cari Tingkatan..."
        />

        {/* 3. Kelas */}
        <GlassDropdown
          value={kelasFilter}
          onChange={onKelasFilterChange}
          options={kelasDropdownOptions}
          defaultLabel="Semua Kelas"
          icon={<BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
          activeColorClass="border-sky-500/50 text-sky-300 ring-sky-500/20"
          minWidthClass="w-full"
          searchPlaceholder="Cari kelas..."
        />

        {/* 4. Status Domisili */}
        <GlassDropdown
          value={statusDomisiliFilter}
          onChange={onStatusDomisiliFilterChange}
          options={statusDomisiliDropdownOptions}
          defaultLabel="Semua Status Domisili"
          icon={<Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
          activeColorClass="border-emerald-500/50 text-emerald-300 ring-emerald-500/20"
          minWidthClass="w-full"
          searchPlaceholder="Cari status domisili..."
        />

        {/* 5. Kompleks Domisili */}
        <GlassDropdown
          value={domisiliFilter}
          onChange={onDomisiliFilterChange}
          options={domisiliDropdownOptions}
          defaultLabel="Semua Domisili"
          icon={<Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          activeColorClass="border-amber-500/50 text-amber-300 ring-amber-500/20"
          minWidthClass="w-full"
          searchPlaceholder="Cari domisili..."
        />
      </div>
    </div>
  );
}