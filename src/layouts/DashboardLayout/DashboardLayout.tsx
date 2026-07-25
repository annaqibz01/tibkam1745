// src/layouts/DashboardLayout/DashboardLayout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { PageTransition } from '@/components/shared/PageTransition';
import { useAutoBackup } from '@/hooks/useAutoBackup'; // 👈 1. Import Hook

export default function DashboardLayout() {
  const location = useLocation();

  // 🚀 2. Panggil Hook di sini (Akan berjalan silent 1x sehari)
  useAutoBackup();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Sidebar Navigasi Utama */}
      <Sidebar />

      {/* Area Konten Utama */}
      <main className="flex-1 h-full overflow-y-auto">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}