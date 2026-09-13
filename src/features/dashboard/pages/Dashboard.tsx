// src/features/dashboard/pages/Dashboard.tsx
import React from "react";
import { useAuth } from "@/features/auth";
import { useUsers } from "@/features/users";
import { useDashboardSantriStats } from "../hooks/useDashboard";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { AdminStatsGrid } from "../components/AdminStatsGrid";
import { RecentActivityLog } from "../components/RecentActivityLog";
import SantriStatsSummary from "../components/SantriStatsSummary";
import { Loader2, Scissors } from "lucide-react";

interface User {
  name: string;
  username: string;
  role: "admin" | "admin_rambut" | "rambut" | "umum";
}

const Dashboard: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const isAdmin = user?.role === "admin" || user?.role === "admin_rambut";

  const { getUsers } = useUsers();
  const { data: users, isLoading: isUsersLoading } = getUsers;

  const { data: santriStats, isLoading: isSantriLoading } =
    useDashboardSantriStats();

  const isInitialLoading = !user || (isAdmin && isUsersLoading);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans select-none">
        <div className="flex flex-col items-center gap-2.5 p-5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-lg">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-xs text-zinc-400 font-sans">
            Memuat ringkasan dashboard...
          </p>
        </div>
      </div>
    );
  }

  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case "admin":
      case "admin_rambut": {
        const safeUsers = users || [];
        return (
          <div className="space-y-4">
            <AdminStatsGrid users={safeUsers} />
            <RecentActivityLog users={safeUsers} />
          </div>
        );
      }

      case "rambut":
        return (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center space-y-2 font-sans">
            <div className="inline-flex p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-indigo-400 mb-1">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Modul Layanan Rambut
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Manajemen antrean perapian rambut santri aktif. Gunakan menu sidebar untuk membuka ruang kerja antrean dan kasir pemindaian barcode.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen p-4 sm:p-5 lg:p-6 space-y-4 font-sans">
      {/* 1. Header Banner */}
      <WelcomeBanner user={user} />

      {/* 2. Ringkasan Statistik Santri Master */}
      <SantriStatsSummary data={santriStats} isLoading={isSantriLoading} />

      {/* 3. Konten Tambahan Berdasarkan Role */}
      {renderRoleSpecificContent()}
    </div>
  );
};

export default Dashboard;