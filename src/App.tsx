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
import { LaporanRambutPage as LaporanRambut } from '@/features/laporan';

export default function App() {
  return (
    <ToastProvider>
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
            {/* 🟢 Akses Umum (Semua User Terautentikasi) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/master" element={<Master />} />

            {/* 🛡️ Kelola Users (Khusus Admin & Admin Rambut) */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["admin", "admin_rambut"]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            {/* ✂️ Layanan Divisi Rambut (Admin, Admin Rambut & Petugas Rambut) */}
            <Route
              path="/rambut"
              element={
                <ProtectedRoute allowedRoles={["admin", "admin_rambut", "rambut"]}>
                  <Rambut />
                </ProtectedRoute>
              }
            />
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
    </ToastProvider>
  );
}