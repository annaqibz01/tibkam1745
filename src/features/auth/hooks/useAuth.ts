// src/features/auth/hooks/useAuth.ts
import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { ClientResponseError } from 'pocketbase';// Atau 'pocketbase' sesuai import project Anda
import type { UsersResponse } from '@/types/pocketbase-types'; 

type AuthResult = { success: boolean; error?: string };

// Fungsi penanganan error asinkron khusus untuk alur login
async function extractLoginErrorMessage(error: unknown, username: string): Promise<string> {
  if (error instanceof ClientResponseError) {
    // 1. Jika server mati atau masalah jaringan
    if (error.status === 0) {
      return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
    }

    // 2. Jika kredensial salah (Username/Password tidak cocok)
    if (error.status === 400) {
      try {
        // Cari data user secara anonim berdasarkan input username/email
        // Pastikan API Rule "View" atau "List" koleksi users di PocketBase mengizinkan pencarian field 'role'
        const userCheck = await pb.collection('users').getFirstListItem(
          `username = "${username}" || email = "${username}"`, 
          { fields: 'role' } // Optimasi: Hanya ambil field role saja
        );

        // Kondisi pesan error berdasarkan tingkat hierarki role
        if (userCheck.role === 'super_admin' || userCheck.role === 'superadmin') {
          return 'Password salah. Jika Anda lupa password Utama, silakan hubungi Tim Pengembang Sistem.';
        } 
        
        if (userCheck.role === 'admin') {
          return 'Password salah. Jika Anda lupa password Admin, silakan hubungi Super Admin.';
        }

        // Default untuk user biasa
        return 'Username atau password salah. Jika Anda lupa, silakan hubungi Admin.';
      } catch {
        // Fallback jika username memang tidak terdaftar atau API Rule PocketBase dikunci total
        return 'Username atau password salah. Jika Anda lupa kredensial, silakan hubungi Admin.';
      }
    }

    return error.response?.message || error.message || 'Gagal masuk ke sistem.';
  }

  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan pada sistem.';
}

// Fungsi penanganan error umum (untuk sync & refresh session)
function extractGeneralErrorMessage(error: unknown): string {
  if (error instanceof ClientResponseError) {
    if (error.status === 0) return 'Koneksi ke server terputus.';
    return error.message;
  }
  return 'Sesi tidak valid.';
}

export function useAuth() {
  const [user, setUser] = useState<UsersResponse | null>(pb.authStore.model as UsersResponse | null);
  const [isValid, setIsValid] = useState<boolean>(pb.authStore.isValid);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncAuthState = useCallback(() => {
    const model = pb.authStore.model as UsersResponse | null;
    if (model && model.status === false) {
      pb.authStore.clear();
    } else {
      setUser(model);
      setIsValid(pb.authStore.isValid);
    }
  }, []);

  const validateSession = useCallback(async () => {
    if (!pb.authStore.isValid) {
      syncAuthState();
      setIsLoading(false);
      return;
    }

    try {
      const refreshData = await pb.collection('users').authRefresh();
      if (refreshData.record && (refreshData.record as unknown as UsersResponse).status === false) {
        console.warn('Sesi dibatalkan otomatis karena akun dinonaktifkan.');
        pb.authStore.clear();
      }
    } catch (error) {
      console.warn('Session refresh failed:', extractGeneralErrorMessage(error));
      pb.authStore.clear();
    } finally {
      setIsLoading(false);
    }
  }, [syncAuthState]);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      const userModel = model as UsersResponse | null;
      if (userModel && userModel.status === false) {
        pb.authStore.clear();
        setUser(null);
        setIsValid(false);
        return;
      }
      setUser(userModel);
      setIsValid(pb.authStore.isValid);
    });

    validateSession();

    return () => {
      unsubscribe();
    };
  }, [validateSession]);

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const authData = await pb.collection('users').authWithPassword(username, password);
      const userModel = authData.record as unknown as UsersResponse;
      
      if (userModel && userModel.status === false) {
        pb.authStore.clear();
        return { 
          success: false, 
          error: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator sistem.' 
        };
      }

      return { success: true };
    } catch (error) {
      // Menggunakan penanganan error kustom yang dinamis berdasarkan input username
      const dynamicError = await extractLoginErrorMessage(error, username);
      return { success: false, error: dynamicError };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback((): void => {
    pb.authStore.clear();
  }, []);

  return {
    user,
    isValid,
    isLoading,
    login,
    logout,
  };
}