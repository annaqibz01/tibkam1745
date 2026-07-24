/// <reference types="vite/client" />
import PocketBase, { BaseAuthStore } from 'pocketbase';

class SessionAuthStore extends BaseAuthStore {
  constructor() {
    super();
    try {
      const data = JSON.parse(sessionStorage.getItem('pb_auth') || '{}');
      this.save(data.token || '', data.model || null);
    } catch {
      this.clear();
    }
  }

  save(token: string, model: any) {
    super.save(token, model);
    sessionStorage.setItem('pb_auth', JSON.stringify({ token, model }));
  }

  clear() {
    super.clear();
    sessionStorage.removeItem('pb_auth');
  }
}

// 🎯 Dapatkan URL PocketBase secara dinamis & aman
const getPocketBaseUrl = () => {
  // 1. Jika ada variabel lingkungan VITE_PB_URL di .env
  if (import.meta.env.VITE_PB_URL) {
    return import.meta.env.VITE_PB_URL;
  }
  // 2. Jika di mode Dev atau berjalan dalam window Tauri
  if (import.meta.env.DEV || (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window)) {
    return 'http://127.0.0.1:8090';
  }
  // 3. Jika di-host langsung oleh PocketBase (pb_public)
  return '/';
};

export const pb = new PocketBase(getPocketBaseUrl(), new SessionAuthStore());
pb.autoCancellation(false);