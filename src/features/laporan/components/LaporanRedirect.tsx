// src/features/laporan/components/LaporanRedirect.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import type { UsersResponse } from "@/types/pocketbase-types";

export const LaporanRedirect: React.FC = () => {
  const { user } = useAuth();
  const currentUser = user as UsersResponse | null;
  
  // 🎯 Cast ke string agar TypeScript mengizinkan pengecekan role baru di masa depan
  const role = currentUser?.role as string | undefined;

  // 1. Role Penyidik / Admin Penyidik -> Auto Redirect ke Laporan Penyidik (Masa Depan)
  if (role === "admin_penyidik" || role === "penyidik") {
    return <Navigate to="/laporan/penyidik" replace />;
  }

  // 2. Role Superadmin, Admin Rambut, Rambut -> Auto Redirect ke Laporan Rambut
  if (role === "admin" || role === "admin_rambut" || role === "rambut") {
    return <Navigate to="/laporan/rambut" replace />;
  }

  // 3. Role tanpa akses laporan (misal: "umum") -> Kembali ke Dashboard
  return <Navigate to="/dashboard" replace />;
};  