// src/components/shared/CustomTitleBar.tsx
import React, { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getVersion } from "@tauri-apps/api/app";
import { Minus, Square, Copy, X } from "lucide-react";

const appWindow = getCurrentWindow();

export const CustomTitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");

  useEffect(() => {
    // 🔮 Ambil versi murni dari tauri.conf.json via capabilities API
    getVersion()
      .then((ver) => setAppVersion(`v${ver}`))
      .catch((err) => console.warn("Gagal membaca versi Tauri:", err));

    const updateMaximizedState = async () => {
      try {
        setIsMaximized(await appWindow.isMaximized());
      } catch (err) {
        console.warn("Gagal membaca status maximize:", err);
      }
    };
    updateMaximizedState();

    const unlistenPromise = appWindow.onResized(async () => {
      try {
        setIsMaximized(await appWindow.isMaximized());
      } catch {}
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  const handleMinimize = async () => {
    try {
      await appWindow.minimize();
    } catch (err) {
      console.error("Gagal minimize:", err);
    }
  };

  const handleToggleMaximize = async () => {
    try {
      await appWindow.toggleMaximize();
      setIsMaximized(await appWindow.isMaximized());
    } catch (err) {
      console.error("Gagal toggle maximize:", err);
    }
  };

  const handleClose = async () => {
    try {
      await appWindow.close();
    } catch (err) {
      console.error("Gagal close:", err);
    }
  };

  return (
    <header className="h-9 w-full bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/80 flex items-center justify-between px-3 select-none text-xs font-mono z-[99999] shrink-0">
      {/* 🔮 Area Drag Kiri */}
      <div data-tauri-drag-region className="flex items-center gap-2.5 cursor-default">
        <img
          src="logo_tibkam_sayap_saja.svg"
          alt="Tibkam Logo"
          className="h-4 w-auto object-contain pointer-events-none"
        />
        <span className="font-extrabold tracking-wider text-gray-200 pointer-events-none">
          TIBKAM<span className="text-indigo-400">1745</span>
        </span>

        {/* Render badge hanya jika versi berhasil dibaca dari Tauri API */}
        {appVersion && (
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-semibold leading-none pointer-events-none">
            {appVersion}
          </span>
        )}
      </div>

      {/* 🔮 Area Drag Tengah (Kosong) */}
      <div data-tauri-drag-region className="flex-1 h-full cursor-default" />

      {/* 🔮 Area Tombol Kontrol */}
      <div className="flex items-center gap-2 z-50">
        <button
          type="button"
          onClick={handleMinimize}
          className="w-9 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-xl transition-all active:scale-95"
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleToggleMaximize}
          className="w-9 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/80 rounded-xl transition-all active:scale-95"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Copy className="w-3.5 h-3.5 rotate-180" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="w-9 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-rose-600/90 rounded-xl transition-all active:scale-95"
          title="Tutup Aplikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};