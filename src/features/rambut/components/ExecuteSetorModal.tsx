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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCatatan("");
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
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
      icon={<Scissors className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 px-1.5 pt-1.5 pb-1 font-sans">
        <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800 space-y-3 select-none">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">ID PPS Santri</span>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {item.id_pps}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-bold text-white truncate">{santriData?.nama || "Santri"}</p>
              <p className="text-xs text-zinc-400 truncate">{santriData?.kelas || "-"} {santriData?.tingkatan || "-"}</p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Waktu Istiwa' Sidogiri:</span>
          </div>
          <span className="font-mono text-xs font-extrabold text-white bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            {waktuWis.stringLengkap}
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">Catatan Tambahan (Opsional)</label>
          <input
            ref={inputRef}
            type="text"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder=""
            className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Verifikasi Setor</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};