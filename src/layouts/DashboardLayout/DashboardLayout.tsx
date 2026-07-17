// src/layouts/DashboardLayout/DashboardLayout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { PageTransition } from '@/components/shared/PageTransition';

export default function DashboardLayout() {
  const location = useLocation();

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