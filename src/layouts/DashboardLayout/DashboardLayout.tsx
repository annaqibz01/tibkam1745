// src/layouts/DashboardLayout/DashboardLayout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { PageTransition } from '@/components/shared/PageTransition';
import { useAutoBackup } from '@/hooks/useAutoBackup';

export default function DashboardLayout() {
  const location = useLocation();

  useAutoBackup();

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-950 text-gray-100">
      <Sidebar />

      {/* 🔮 Tambahkan min-h-0 agar scrollbar internal hanya bekerja di dalam area main */}
      <main className="flex-1 h-full min-h-0 overflow-y-auto">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}