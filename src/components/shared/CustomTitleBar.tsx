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
    <header className="h-9 w-full bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-3 select-none text-xs font-sans z-[99999] shrink-0">
      {/* Area Drag Kiri */}
      <div data-tauri-drag-region className="flex items-center gap-2 cursor-default">
        <img
          src="logo_tibkam_sayap_saja.svg"
          alt="Tibkam Logo"
          className="h-4 w-auto object-contain pointer-events-none"
        />
        <span className="font-bold tracking-wide text-zinc-200 pointer-events-none text-xs">
          TIBKAM<span className="text-indigo-400 font-mono">1745</span>
        </span>

        {appVersion && (
          <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.2 rounded font-medium leading-none pointer-events-none">
            {appVersion}
          </span>
        )}
      </div>

      {/* Area Drag Tengah (Kosong) */}
      <div data-tauri-drag-region className="flex-1 h-full cursor-default" />

      {/* 
        Area Tombol Kontrol Window 
        🛡️ Diproteksi dengan tabIndex={-1} agar TIDAK BISA terpilih saat menekan tombol Tab di keyboard
      */}
      <div className="flex items-center gap-1 z-50">
        <button
          type="button"
          tabIndex={-1}
          onClick={handleMinimize}
          className="w-9 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors focus:outline-none"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={handleToggleMaximize}
          className="w-9 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors focus:outline-none"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Copy className="w-3 h-3 rotate-180" />
          ) : (
            <Square className="w-3 h-3" />
          )}
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={handleClose}
          className="w-9 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-rose-600 rounded-md transition-colors focus:outline-none"
          title="Tutup Aplikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};