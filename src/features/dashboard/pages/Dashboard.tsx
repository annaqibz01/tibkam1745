// src/pages/Dashboard.tsx
import React from 'react';
import { useAuth } from '@/features/auth';
import { useUsers } from '@/features/users';
import { useDashboardSantriStats } from '../hooks/useDashboard'; // ✅ Menggunakan hook sehat yang baru
import { WelcomeBanner } from '../components/WelcomeBanner';
import { AdminStatsGrid } from '../components/AdminStatsGrid';
import { RecentActivityLog } from '../components/RecentActivityLog';
import SantriStatsSummary from '../components/SantriStatsSummary';
import { Loader2, Scissors } from 'lucide-react';

interface User {
  name: string;
  username: string;
  role: 'admin' | 'rambut' | 'umum';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const { getUsers } = useUsers();
  const { data: users, isLoading: isUsersLoading } = getUsers;

  // ⚡ SEHAT & RAMPING: Panggil data statistik langsung matang dari server cache layer
  const { data: santriStats, isLoading: isSantriLoading } = useDashboardSantriStats();

  // ⏳ State Loading Mewah Khusus Sinkronisasi Awal
  if (!user || isUsersLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gray-950 text-indigo-400 p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-3.5 p-6 rounded-3xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-xl shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-xs font-mono text-gray-400 animate-pulse">
            Sinkronisasi data real-time...
          </p>
        </div>
      </div>
    );
  }

  // 🎯 Konten Tambahan Khusus Berdasarkan Role
  const renderRoleSpecificContent = () => {
    const safeUsers = users || [];

    switch (user.role) {
      case 'admin':
        return (
          <div className="space-y-6 pt-2">
            <AdminStatsGrid users={safeUsers} />
            <div className="w-full">
              <RecentActivityLog users={safeUsers} />
            </div>
          </div>
        );

      case 'rambut':
        return (
          <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-3">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
            <div className="inline-flex p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-1">
              <Scissors className="w-6 h-6" />
            </div>
            <h3 className="text-base font-mono font-bold text-white">
              Modul Layanan Rambut
            </h3>
            <p className="text-xs font-mono text-gray-400 max-w-md mx-auto leading-relaxed">
              Manajemen antrean perapian rambut santri aktif. Gunakan menu sidebar untuk membuka ruang kerja penuh.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* 1. Welcome Banner (Shared untuk Semua Role) */}
      <WelcomeBanner user={user} />

      {/* 2. Ringkasan Statistik Santri Matang (Tanpa lag re-render komponen) */}
      <SantriStatsSummary data={santriStats} isLoading={isSantriLoading} />

      {/* 3. Konten Tambahan Khusus Role */}
      {renderRoleSpecificContent()}
    </div>
  );
};

export default Dashboard;