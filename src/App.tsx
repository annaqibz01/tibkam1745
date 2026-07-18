// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from '@/features/auth';
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout';
import {LoginPage as Login} from '@/features/auth';
import { DashboardPage as Dashboard } from '@/features/dashboard';
import {ProfilePage as Profile} from '@/features/profile'; 
import { UsersPage as Users } from '@/features/users';
import { MasterPage as Master } from '@/features/master';
import { KalenderPage as Kalender } from '@/features/kalender';
import { RambutPage as Rambut } from '@/features/rambut';
import { PageTransition } from './components/shared/PageTransition';



export default function App() {
  return (
    // ✨ Bungkus di tingkat teratas agar toast bisa muncul dari mana saja!
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes dengan Layout & Guard */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Halaman-halaman terproteksi */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Users />} />
            <Route path="/master" element={<Master />} />
            <Route path="/kalender" element={<Kalender />} />
            <Route path="/rambut" element={<Rambut />} /> {/* ✨ Route Layanan Rambut */}
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-All Route: Redirect ke root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}