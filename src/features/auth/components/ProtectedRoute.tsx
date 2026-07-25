import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import type { UsersRoleOptions } from '@/types/pocketbase-types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Role yang diizinkan mengakses rute ini (Opsional) */
  allowedRoles?: UsersRoleOptions[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isValid, isLoading } = useAuth();
  const location = useLocation();

  // 1. Loading state verifikasi sesi
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-gray-400 text-sm font-mono">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  // 2. Belum terautentikasi -> Tendang ke Halaman Login
  if (!isValid || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 3. 🛡️ CEK OTORISASI ROLE: Jika user tidak memiliki role yang diizinkan -> Redirection ke Dashboard
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role as UsersRoleOptions;
    if (!allowedRoles.includes(userRole)) {
      console.warn(`⛔ [Akses Ditolak] Role '${userRole}' tidak diizinkan membuka jalur '${location.pathname}'`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 4. Lolos Autentikasi & Otorisasi
  return <>{children}</>;
}