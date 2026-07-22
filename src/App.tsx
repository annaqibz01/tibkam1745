// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
      <BrowserRouter>
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
            <Route path="/users" element={<Users />} />
            <Route path="/master" element={<Master />} />
            <Route path="/kalender" element={<Kalender />} />
            <Route path="/rambut" element={<Rambut />} />
            <Route path="/laporan/rambut" element={<LaporanRambut />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}