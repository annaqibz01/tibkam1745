// src/pages/Dashboard.tsx
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pb } from '../services/pocketbase';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { WelcomeBanner } from '../components/dashboard/shared/WelcomeBanner';
import { AdminStatsGrid } from '../components/dashboard/admin/AdminStatsGrid';
import { RecentActivityLog } from '../components/dashboard/admin/RecentActivityLog';
import SantriStatsSummary, { SantriStatsData } from '../components/dashboard/shared/SantriStatsSummary';
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

  // 🚀 Fetch Data Santri dari PocketBase
  const { data: santriList, isLoading: isSantriLoading } = useQuery({
    queryKey: ['dashboard-santri-stats'],
    queryFn: async () => {
      return await pb.collection('master').getFullList({
        fields: 'status_aktif,tingkatan,status_domisili,domisili',
      });
    },
    staleTime: 1000 * 60 * 5,
  });

  // 📊 Agregasi Data Santri (Shared untuk Semua Role)
  const santriStats = useMemo<SantriStatsData | undefined>(() => {
    if (!santriList) return undefined;

    let totalSantriAktif = 0;
    let totalPps = 0;
    let totalLpps = 0;
    const tingkatanCounts: Record<string, number> = {};
    const domisiliCounts: Record<string, number> = {};

    santriList.forEach((item) => {
      // 🚫 Abaikan santri non-aktif
      if (!item.status_aktif) return;

      totalSantriAktif++;

      const statusDomisili = (item.status_domisili || '').toString().trim().toUpperCase();
      const domisiliVal = (item.domisili || '').toString().trim().toUpperCase();
      const firstChar = domisiliVal.charAt(0);

      // 1. DOMISILI PPS (A-T & Z)
      if (statusDomisili === 'PPS') {
        const isATorZ = (firstChar >= 'A' && firstChar <= 'T') || firstChar === 'Z';
        const isNotDKSK = !domisiliVal.startsWith('DKS') && !domisiliVal.includes('DKS-K');

        if (isATorZ && isNotDKSK) {
          totalPps++;
          
          // Kelompokkan berdasarkan huruf Kompleks saja (bukan per kamar)
          const namaKompleks = `Daerah ${firstChar}`;
          domisiliCounts[namaKompleks] = (domisiliCounts[namaKompleks] || 0) + 1;
        }
      } 
      // 2. DOMISILI LPPS
      else if (statusDomisili === 'LPPS') {
        totalLpps++;
      }

      // 3. SEBARAN TINGKATAN (Gabungkan Idadiyah)
      let rawTingkatan = item.tingkatan?.toString().trim() || 'Lainnya';
      let normTingkatan = rawTingkatan;

      const lowerTingkatan = rawTingkatan.toLowerCase();
      if (
        lowerTingkatan.includes('idadiyah') || 
        lowerTingkatan.includes('almiftah') || 
        lowerTingkatan.includes('al-miftah')
      ) {
        normTingkatan = 'Idadiyah';
      }

      if (normTingkatan && normTingkatan !== '-') {
        tingkatanCounts[normTingkatan] = (tingkatanCounts[normTingkatan] || 0) + 1;
      }
    });

    return {
      totalSantriAktif,
      totalPps,
      totalLpps,
      tingkatanCounts,
      domisiliCounts,
    };
  }, [santriList]);

  // ⏳ State Loading yang Dihaluskan
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

      case 'umum':
        // 💡 Role 'umum' tidak membutuhkan card placeholder.
        // Cukup menampilkan Dashboard Shared Utama (WelcomeBanner + SantriStatsSummary).
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* 1. Welcome Banner (Shared untuk Semua Role) */}
      <WelcomeBanner user={user} />

      {/* 2. Ringkasan Statistik Santri Real-time (Shared untuk Semua Role) */}
      <SantriStatsSummary data={santriStats} isLoading={isSantriLoading} />

      {/* 3. Konten Tambahan Khusus Role (Admin / Rambut / Omit for Umum) */}
      {renderRoleSpecificContent()}
    </div>
  );
};

export default Dashboard;