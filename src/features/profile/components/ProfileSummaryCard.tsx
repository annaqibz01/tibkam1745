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
    <div className="w-full space-y-4 select-none font-sans">
      {/* 1. HERO PROFILE CARD */}
      <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full">
            {/* Foto Profil */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-indigo-500/20 border-2 border-indigo-500/30 bg-zinc-800 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 hover:ring-indigo-500/40">
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
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-zinc-900 shadow-md" />
              </span>
            </div>

            {/* Nama & Badges */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {user?.name || user?.username || "Pengguna"}
                </h2>
                {user?.verified && (
                  <span title="Akun Terverifikasi" className="inline-flex items-center">
                    <BadgeCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  </span>
                )}
              </div>

              <p className="text-xs font-mono text-indigo-300/80">
                @{user?.username}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-shrink-0">
            <button
              type="button"
              onClick={onOpenEditModal}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors active:scale-[0.98] whitespace-nowrap w-full sm:w-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Informasi</span>
            </button>

            <button
              type="button"
              onClick={onOpenPasswordModal}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 font-semibold text-xs rounded-lg border border-zinc-800 hover:border-amber-500/40 shadow-sm transition-colors active:scale-[0.98] whitespace-nowrap w-full sm:w-auto"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Ubah Kata Sandi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Panel Kiri: Informasi Personal */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-sm space-y-4 w-full">
          <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
            <div className="p-2 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Informasi Personal & Identitas
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">
                Nama Lengkap
              </span>
              <p className="text-sm font-semibold text-white mt-0.5">
                {user?.name || "-"}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">
                Username Sistem
              </span>
              <p className="text-sm font-mono font-bold text-indigo-300 mt-0.5">
                @{user?.username || "-"}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">
                Tingkat Hak Akses
              </span>
              <p className="text-xs font-semibold text-zinc-200 capitalize mt-0.5">
                {user?.role || "Umum"}
              </p>
            </div>
          </div>
        </div>

        {/* Panel Kanan: Kredensial & Sistem */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-sm space-y-4 w-full">
          <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
            <div className="p-2 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Kredensial & Sistem
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                ID Unik Pengguna (UUID)
              </span>
              <p className="text-xs font-mono font-bold text-zinc-300 tracking-wider truncate mt-0.5">
                {user?.id || "-"}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Terdaftar Sejak
              </span>
              <p className="text-xs font-semibold text-zinc-200 mt-0.5">
                {formattedDate}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Proteksi Akses
              </span>
              <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">
                Otentikasi Enkripsi PocketBase Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};