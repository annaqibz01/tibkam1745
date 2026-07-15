// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Master from './pages/Master';
import Kalender from './pages/Kalender';
import Rambut from './pages/Rambut'; // ✨ Import halaman Layanan Rambut
import { PageTransition } from './components/shared/PageTransition';

/**
 * Layout khusus halaman terproteksi dengan Transisi Instant-Smooth
 */
function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100">
      {/* Sidebar Navigasi Utama */}
      <Sidebar />

      {/* Area Konten Utama */}
      <main className="flex-1 h-full overflow-y-auto">
        {/* ✨ KUNCI: key={location.pathname} langsung memicu transisi halus instan */}
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}

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