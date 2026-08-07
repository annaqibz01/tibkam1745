// src/features/auth/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";
import type { UsersRoleOptions } from "@/types/pocketbase-types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UsersRoleOptions[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isValid, isLoading } = useAuth();
  const location = useLocation();

  // 1. Loading State Verifikasi Sesi
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-mono">
        <div className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-gray-800/80 bg-gray-900/60 backdrop-blur-xl shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-gray-400 text-xs font-semibold">Memverifikasi Sesi Kredensial...</p>
        </div>
      </div>
    );
  }

  // 2. Belum Terautentikasi -> Redirect ke Halaman Login
  if (!isValid || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 3. Otorisasi Role Spesifik
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role as UsersRoleOptions;
    if (!allowedRoles.includes(userRole)) {
      console.warn(`⛔ [Akses Ditolak] Role '${userRole}' tidak memiliki hak akses ke jalur '${location.pathname}'`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 4. Lolos Autentikasi & Otorisasi
  return <>{children}</>;
}