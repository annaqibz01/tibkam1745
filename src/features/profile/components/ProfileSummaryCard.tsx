// src/features/profile/components/ProfileSummaryCard.tsx
import React from "react";
import type { UsersResponse } from "@/types/pocketbase-types";
import { getAvatarUrl } from "@/features/users/hooks/useUsers";
import { StatusBadge, type BadgeVariant } from "@/components/shared";
import {
  User,
  Shield,
  CheckCircle2,
  Calendar,
  Edit3,
  KeyRound,
  Fingerprint,
  BadgeCheck,
  Lock,
  ShieldAlert,
} from "lucide-react";

interface ProfileSummaryCardProps {
  user: UsersResponse | null;
  onOpenEditModal: () => void;
  onOpenPasswordModal: () => void;
}

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  user,
  onOpenEditModal,
  onOpenPasswordModal,
}) => {
  const avatarUrl = user ? getAvatarUrl(user) : null;

  const nameInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.username
      ? user.username.charAt(0).toUpperCase()
      : "?";

  const getRoleVariant = (role?: string): BadgeVariant => {
    switch (role?.toLowerCase()) {
      case "admin":
      case "admin_rambut":
        return "info";
      case "rambut":
        return "info";
      default:
        return "success";
    }
  };

  const formattedDate = user?.created
    ? new Date(user.created).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="w-full space-y-6 select-none font-sans">
      {/* 1. HERO PROFILE CARD */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
            {/* Foto Profil */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-indigo-500/20 border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-950 to-gray-800 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 hover:ring-indigo-500/40">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-mono text-3xl font-extrabold text-indigo-300">
                    {nameInitial}
                  </span>
                )}
              </div>

              <span className="absolute bottom-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-gray-900 shadow-md" />
              </span>
            </div>

            {/* Nama & Badges */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user?.name || user?.username || "Pengguna"}
                </h2>
                {user?.verified && (
                  <span title="Akun Terverifikasi" className="inline-flex items-center">
                    <BadgeCheck className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-mono text-indigo-300/80">
                @{user?.username}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                <StatusBadge variant={getRoleVariant(user?.role)} dot>
                  {user?.role || "Umum"}
                </StatusBadge>

                <StatusBadge
                  variant={user?.verified ? "success" : "warning"}
                  icon={
                    user?.verified ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {user?.verified ? "Terverifikasi" : "Pending Verifikasi"}
                </StatusBadge>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Modal */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto flex-shrink-0 font-mono">
            <button
              type="button"
              onClick={onOpenEditModal}
              className="group inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 border border-indigo-400/30 transition-all duration-200 active:scale-95 whitespace-nowrap w-full sm:w-auto"
            >
              <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Edit Informasi</span>
            </button>

            <button
              type="button"
              onClick={onOpenPasswordModal}
              className="group inline-flex items-center justify-center gap-2 px-5 py-3 bg-gray-950/60 hover:bg-amber-500/10 text-gray-300 hover:text-amber-300 font-semibold text-xs rounded-2xl border border-gray-800/80 hover:border-amber-500/40 shadow-lg transition-all duration-200 active:scale-95 whitespace-nowrap w-full sm:w-auto"
            >
              <KeyRound className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
              <span>Ubah Kata Sandi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Panel Kiri: Informasi Personal */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-6 sm:p-7 shadow-xl backdrop-blur-xl space-y-5 w-full">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-mono font-semibold text-gray-200 uppercase tracking-wider">
                Informasi Personal & Identitas
              </h3>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider">
                Nama Lengkap
              </span>
              <span className="text-sm font-semibold text-white">
                {user?.name || "-"}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider">
                Username Sistem
              </span>
              <span className="text-sm font-mono font-bold text-indigo-300">
                @{user?.username || "-"}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider">
                Tingkat Hak Akses
              </span>
              <span className="text-xs font-semibold text-gray-200 capitalize">
                {user?.role || "Umum"}
              </span>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Kredensial & Sistem */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-6 sm:p-7 shadow-xl backdrop-blur-xl space-y-5 w-full">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

          <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-mono font-semibold text-gray-200 uppercase tracking-wider">
                Kredensial & Sistem
              </h3>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                ID Unik Pengguna (UUID)
              </span>
              <span className="text-xs font-mono font-bold text-gray-300 tracking-wider truncate">
                {user?.id || "-"}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Terdaftar Sejak
              </span>
              <span className="text-xs font-semibold text-gray-200">
                {formattedDate}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800/80">
              <span className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Proteksi Akses
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-400">
                Otentikasi Enkripsi PocketBase Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};