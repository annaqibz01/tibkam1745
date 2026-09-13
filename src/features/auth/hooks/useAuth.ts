// src/features/auth/hooks/useAuth.ts
import { useEffect, useState, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { ClientResponseError } from 'pocketbase';
import type { UsersResponse } from '@/types/pocketbase-types';

type AuthResult = { success: boolean; error?: string };

// Penanganan pesan error yang realistis untuk sistem desktop offline
function extractLoginErrorMessage(error: unknown): string {
  if (error instanceof ClientResponseError) {
    // Status 0: Engine PocketBase lokal belum menyala atau port 8090 terblokir
    if (error.status === 0) {
      return 'Layanan database lokal belum siap. Tunggu beberapa detik lalu coba lagi.';
    }

    if (error.status === 400) {
      return 'Username atau kata sandi salah. Silakan periksa kembali.';
    }

    return error.response?.message || error.message || 'Gagal masuk ke sistem.';
  }

  if (error instanceof Error) return error.message;
  return 'Terjadi kesalahan sistem internal.';
}

function extractGeneralErrorMessage(error: unknown): string {
  if (error instanceof ClientResponseError) {
    if (error.status === 0) return 'Koneksi database lokal terputus.';
    return error.message;
  }
  return 'Sesi kredensial tidak valid.';
}

export function useAuth() {
  const [user, setUser] = useState<UsersResponse | null>(pb.authStore.model as UsersResponse | null);
  const [isValid, setIsValid] = useState<boolean>(pb.authStore.isValid);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const syncAuthState = useCallback(() => {
    const model = pb.authStore.model as UsersResponse | null;
    if (model && model.status === false) {
      pb.authStore.clear();
      setUser(null);
      setIsValid(false);
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
        console.warn('Sesi dibatalkan otomatis karena status akun dinonaktifkan.');
        pb.authStore.clear();
      }
    } catch (error) {
      console.warn('Verifikasi sesi gagal:', extractGeneralErrorMessage(error));
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
      const authData = await pb.collection('users').authWithPassword(username.trim(), password);
      const userModel = authData.record as unknown as UsersResponse;

      if (userModel && userModel.status === false) {
        pb.authStore.clear();
        return {
          success: false,
          error: 'Akun Anda dinonaktifkan. Silakan hubungi petugas Administrator.'
        };
      }

      return { success: true };
    } catch (error) {
      const dynamicError = extractLoginErrorMessage(error);
      return { success: false, error: dynamicError };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback((): void => {
    pb.authStore.clear();
    setUser(null);
    setIsValid(false);
  }, []);

  return {
    user,
    isValid,
    isLoading,
    login,
    logout,
  };
}