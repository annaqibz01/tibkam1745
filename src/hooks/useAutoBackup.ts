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
        // 1. Cek apakah user sudah terautentikasi di PocketBase
        if (!pb.authStore.isValid) return;

        const todayStr = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
        const lastBackupDate = localStorage.getItem(LAST_BACKUP_KEY);

        // 2. Jika hari ini sudah pernah backup, batalkan (cukup 1x sehari)
        if (lastBackupDate === todayStr) {
          return;
        }

        isExecutingRef.current = true;
        console.log("🔄 [Auto-Backup] Memulai pembuatan cadangan otomatis...");

        const backupFileName = `auto_backup_${todayStr}.zip`;

        // 3. Minta PocketBase buat snapshot ZIP secara aman
        try {
          await pb.backups.create(backupFileName);
        } catch {
          // Abaikan jika file snapshot harian sudah terbentuk di PocketBase
        }

        // 4. Minta Rust menyalin ke Documents/Tibkam1745_Backups & rotasi 7 file
        if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
          const savedPath = await invoke<string>("sync_auto_backup", {
            backupFilename: backupFileName,
          });
          console.log(`✅ [Auto-Backup] Berhasil disinkronkan ke Documents: ${savedPath}`);
        }

        // 5. Catat penanda sukses hari ini
        localStorage.setItem(LAST_BACKUP_KEY, todayStr);
      } catch (err) {
        console.warn("⚠️ [Auto-Backup Error]:", err);
      } finally {
        isExecutingRef.current = false;
      }
    };

    // Beri jeda 3 detik setelah login/dashboard terbuka agar loading utama selesai dulu
    const timer = setTimeout(() => {
      runSilentAutoBackup();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
}