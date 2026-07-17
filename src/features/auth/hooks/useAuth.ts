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

  const syncAuthState = useCallback(() => {
    setUser(pb.authStore.model as RecordModel | null);
    setIsValid(pb.authStore.isValid);
  }, []);

  const validateSession = useCallback(async () => {
    // Guest guard: skip authRefresh if no token is present
    if (!pb.authStore.isValid) {
      syncAuthState();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      await pb.collection('users').authRefresh();
    } catch (error) {
      console.warn('Session refresh failed:', extractErrorMessage(error));
      pb.authStore.clear();
    } finally {
      syncAuthState();
      setIsLoading(false);
    }
  }, [syncAuthState]);

  useEffect(() => {
    // Subscribe to auth store changes
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser(model as RecordModel | null);
      setIsValid(pb.authStore.isValid);
    });

    // Initial session validation
    validateSession();

    return () => {
      unsubscribe();
    };
  }, [validateSession]);

  const login = useCallback(async (username: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      await pb.collection('users').authWithPassword(username, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: extractErrorMessage(error) };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback((): void => {
    pb.authStore.clear();
    // onChange listener will update state automatically
  }, []);

  return {
    user,
    isValid,
    isLoading,
    login,
    logout,
  };
}