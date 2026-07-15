/// <reference types="vite/client" />
import PocketBase, { BaseAuthStore } from 'pocketbase';

// ----------------------------------------------------------------------
// Custom AuthStore Berbasis sessionStorage
// ----------------------------------------------------------------------
class SessionAuthStore extends BaseAuthStore {
  constructor() {
    super();
    try {
      // Ambil data sesi terakhir dari sessionStorage saat aplikasi pertama kali dimuat
      const data = JSON.parse(sessionStorage.getItem('pb_auth') || '{}');
      this.save(data.token || '', data.model || null);
    } catch {
      this.clear();
    }
  }

  // Dieksekusi otomatis oleh SDK PocketBase saat login sukses / refresh token
  save(token: string, model: any) {
    super.save(token, model);
    sessionStorage.setItem('pb_auth', JSON.stringify({ token, model }));
  }

  // Dieksekusi otomatis saat pb.authStore.clear() dipanggil (Logout)
  clear() {
    super.clear();
    sessionStorage.removeItem('pb_auth');
  }
}

// ----------------------------------------------------------------------
// Inisialisasi SDK PocketBase dengan SessionAuthStore
// ----------------------------------------------------------------------
const url = import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/';

// Oper instance SessionAuthStore ke constructor PocketBase
export const pb = new PocketBase(url, new SessionAuthStore());

// Nonaktifkan auto-cancellation jika kamu sering melakukan fetching data bersamaan
pb.autoCancellation(false);