// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from '@/features/auth';
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout';
import { LoginPage as Login } from '@/features/auth';
import { DashboardPage as Dashboard } from '@/features/dashboard';
import { ProfilePage as Profile } from '@/features/profile';
import { UsersPage as Users } from '@/features/users';
import { MasterPage as Master } from '@/features/master';
import { KalenderPage as Kalender } from '@/features/kalender';
import { RambutPage as Rambut } from '@/features/rambut';
import { LaporanRambutPage as LaporanRambut, LaporanRedirect } from "@/features/laporan";
import { CustomTitleBar } from '@/components/shared';

export default function App() {
  return (
    <ToastProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-950 text-gray-100 select-none">
        <CustomTitleBar />

        {/* 🔮 KUNCI: Tambahkan min-h-0 agar flex child tidak meluap keluar layar */}
        <div className="flex-1 min-h-0 w-full overflow-hidden relative">
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/master" element={<Master />} />

                <Route
                  path="/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "admin_rambut"]}>
                      <Users />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/rambut"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "admin_rambut", "rambut"]}>
                      <Rambut />
                    </ProtectedRoute>
                  }
                />

                {/* 🎯 Rute Induk /laporan memicu Smart Redirector berdasarkan Role */}
                <Route
                  path="/laporan"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "admin_rambut", "rambut"]}>
                      <LaporanRedirect />
                    </ProtectedRoute>
                  }
                />

                {/* Sub-Rute Laporan Spesifik */}
                <Route
                  path="/laporan/rambut"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "admin_rambut", "rambut"]}>
                      <LaporanRambut />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/kalender"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "admin_rambut", "rambut"]}>
                      <Kalender />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </div>
      </div>
    </ToastProvider>
  );
}