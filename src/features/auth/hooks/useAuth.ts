// src/features/auth/hooks/useAuth.ts
import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { ClientResponseError } from 'pocketbase';

type AuthResult = { success: boolean; error?: string };

function extractErrorMessage(error: unknown): string {
  if (error instanceof ClientResponseError) {
    return error.response?.message || error.message || 'Username atau password salah.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Username atau password salah.';
}

export function useAuth() {
  const [user, setUser] = useState<RecordModel | null>(null);
  const [isValid, setIsValid] = useState<boolean>(pb.authStore.isValid);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🛡️ Guard Pencocokan Status Sinkronisasi Sesi
  const syncAuthState = useCallback(() => {
    const model = pb.authStore.model;
    
    // Jika token valid tapi ternyata status user dirubah jadi nonaktif (false)
    if (model && model.status === false) {
      pb.authStore.clear(); // Tendang paksa sesi dari lokal
      setUser(null);
      setIsValid(false);
    } else {
      setUser(model as RecordModel | null);
      setIsValid(pb.authStore.isValid);
    }
  }, []);

  const validateSession = useCallback(async () => {
    if (!pb.authStore.isValid) {
      syncAuthState();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Refresh token sekaligus mengambil cetakan data user terbaru dari server
      const refreshData = await pb.collection('users').authRefresh();
      
      // 🛡️ Guard 1: Cek apakah di tengah sesi berjalan, akun ini dinonaktifkan oleh Admin
      if (refreshData.record && refreshData.record.status === false) {
        console.warn('Sesi dibatalkan otomatis karena akun dinonaktifkan.');
        pb.authStore.clear();
      }
    } catch (error) {
      console.warn('Session refresh failed:', extractErrorMessage(error));
      pb.authStore.clear();
    } finally {
      syncAuthState();
      setIsLoading(false);
    }
  }, [syncAuthState]);

  useEffect(() => {
    // Berlangganan pada perubahan toko otentikasi lokal
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      // 🛡️ Guard 2: Interseptor real-time jika ada injeksi auth model nonaktif
      if (model && model.status === false) {
        pb.authStore.clear();
        setUser(null);
        setIsValid(false);
        return;
      }
      setUser(model as RecordModel | null);
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
      
      // 🛡️ Guard 3: Interseptor utama saat tombol "Masuk Sistem" diklik
      if (authData.record && authData.record.status === false) {
        pb.authStore.clear(); // Hapus token biner yang terlanjur terunduh
        return { 
          success: false, 
          error: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator system.' 
        };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: extractErrorMessage(error) };
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