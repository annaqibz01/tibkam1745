// src/features/rambut/components/ExecuteSetorModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import type { WajibSetorExpanded } from "../hooks/useRambut";
import { useWaktuIstiwa } from "@/hooks/useWaktuIstiwa";
import { Scissors, Clock, Loader2, Save, User } from "lucide-react";

interface ExecuteSetorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WajibSetorExpanded | null;
  onConfirm: (catatan: string) => void;
  isPending: boolean;
}

export const ExecuteSetorModal: React.FC<ExecuteSetorModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm,
  isPending,
}) => {
  const waktuWis = useWaktuIstiwa();
  const [catatan, setCatatan] = useState("");
  
  // Ref untuk Auto-Focus ke input saat modal terbuka
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCatatan("");
      // Focus otomatis ke input catatan saat modal aktif
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!item) return null;
  const santriData = item.expand?.santri;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;
    onConfirm(catatan);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Verifikasi Perapian Rambut"
      icon={<Scissors className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 px-1.5 pt-1.5 pb-1">
        {/* Detail Santri Target */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gray-950/70 border border-gray-800/80 space-y-3 select-none shadow-inner">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
            <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">
              ID PPS Santri
            </span>
            <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
              {item.id_pps}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {santriData?.nama || "Santri"}
              </p>
              <p className="text-xs font-mono text-gray-400 truncate">
                {santriData?.kelas || "-"} {santriData?.tingkatan || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Live Waktu Istiwa' Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-950/20 to-gray-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 font-bold shrink-0">
            <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Waktu Istiwa' Sidogiri:</span>
          </div>
          <span className="font-mono text-xs sm:text-sm font-extrabold text-white bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 self-start sm:self-auto">
            {waktuWis.stringLengkap}
          </span>
        </div>

        {/* Catatan Tambahan (Auto-Focused & Placeholder Kosong) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-medium text-gray-300">
            Catatan Tambahan (Opsional)
          </label>
          <input
            ref={inputRef}
            type="text"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder=""
            className="w-full px-4 py-3 bg-gray-950/70 border border-gray-800 rounded-2xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all duration-200"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-gray-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 rounded-2xl border border-gray-800 bg-gray-900/80 text-gray-300 hover:bg-gray-800 hover:text-white text-xs font-mono font-semibold active:scale-95 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-mono text-xs font-semibold rounded-2xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all border border-indigo-400/30"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Verifikasi Setor</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};