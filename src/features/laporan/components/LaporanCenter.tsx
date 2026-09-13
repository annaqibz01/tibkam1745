// src/features/laporan/components/LaporanCenter.tsx
import React from "react";
import { Navigate, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth";
import type { UsersRoleOptions } from "@/types/pocketbase-types";
import { Scissors, FileText, type LucideIcon } from "lucide-react";

interface LaporanModule {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: UsersRoleOptions[];
}

const modules: LaporanModule[] = [
  {
    id: "rambut",
    title: "Laporan Rambut",
    description:
      "Rekapitulasi setoran rambut santri Aliyah, Kuliah Syariah, dan Pengurus/Petugas.",
    path: "/laporan/rambut",
    icon: Scissors,
    allowedRoles: ["admin", "admin_rambut", "rambut"],
  },
  // Contoh modul masa depan (Humas):
  // {
  //   id: "humas",
  //   title: "Laporan Humas",
  //   description: "Rekap kegiatan humas dan publikasi.",
  //   path: "/laporan/humas",
  //   icon: FileText,
  //   allowedRoles: ["admin"],
  // },
  // Tambahkan modul lain di sini...
];

export const LaporanCenter: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role as UsersRoleOptions | undefined;

  const accessibleModules = modules.filter((mod) =>
    mod.allowedRoles.includes(role as UsersRoleOptions)
  );

  // Tidak ada akses sama sekali
  if (accessibleModules.length === 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // Hanya satu modul, langsung redirect
  if (accessibleModules.length === 1) {
    return <Navigate to={accessibleModules[0].path} replace />;
  }

  // Lebih dari satu modul -> tampilkan pilihan kartu
  return (
    <div className="bg-zinc-950 min-h-screen p-4 sm:p-5 lg:p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pusat Laporan
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pilih modul laporan yang ingin Anda buka. Modul yang tampil
            disesuaikan dengan hak akses akun Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessibleModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <NavLink
                key={mod.id}
                to={mod.path}
                className="group block rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm hover:bg-zinc-800/60 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      {mod.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};