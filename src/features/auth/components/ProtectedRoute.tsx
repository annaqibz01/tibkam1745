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
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 font-sans select-none">
        <div className="flex flex-col items-center gap-3 p-5 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-zinc-400 text-xs font-medium">Memverifikasi sesi kredensial...</p>
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