import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { pb } from "@/lib/pocketbase";

const LAST_BACKUP_KEY = "tibkam_last_auto_backup_date";

export function useAutoBackup() {
  const isExecutingRef = useRef(false);

  useEffect(() => {
    const runSilentAutoBackup = async () => {
      if (isExecutingRef.current) return;

      try {
        // 1. Cek autentikasi user
        if (!pb.authStore.isValid) return;

        const todayStr = new Date().toISOString().slice(0, 10);
        const lastBackupDate = localStorage.getItem(LAST_BACKUP_KEY);

        // 2. Jika hari ini sudah backup, bypass
        if (lastBackupDate === todayStr) {
          return;
        }

        isExecutingRef.current = true;
        console.log("🔄 [Auto-Backup] Memproses cadangan data otomatis...");

        // 3. Panggil Rust untuk copy data.db langsung ke Documents
        if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
          const savedPath = await invoke<string>("execute_native_auto_backup", {
            dateStr: todayStr,
          });
          console.log(`✅ [Auto-Backup Sukses] File tersimpan di: ${savedPath}`);
        }

        // 4. Catat tanggal sukses
        localStorage.setItem(LAST_BACKUP_KEY, todayStr);
      } catch (err) {
        console.warn("⚠️ [Auto-Backup Error]:", err);
      } finally {
        isExecutingRef.current = false;
      }
    };

    // Jalankan 3 detik setelah aplikasi terbuka
    const timer = setTimeout(() => {
      runSilentAutoBackup();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
}