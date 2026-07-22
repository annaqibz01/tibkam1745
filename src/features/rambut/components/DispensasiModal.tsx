// src/components/rambut/DispensasiModal.tsx
import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import type { WajibSetorExpanded } from "../hooks/useRambut";
import { ShieldAlert, Loader2, Save, User } from "lucide-react";

interface DispensasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WajibSetorExpanded | null;
  onConfirm: (catatan: string) => void;
  isPending: boolean;
}

export const DispensasiModal: React.FC<DispensasiModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirm,
  isPending,
}) => {
  const [alasan, setAlasan] = useState("");

  useEffect(() => {
    if (!isOpen) setAlasan("");
  }, [isOpen]);

  if (!item) return null;
  const santriData = item.expand?.santri;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasan.trim()) return;
    onConfirm(alasan.trim());
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Beri Dispensasi Setoran"
      icon={<ShieldAlert className="w-5 h-5 text-purple-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 px-1.5 pt-1.5 pb-1">
        {/* Detail Santri */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-gray-950/70 border border-gray-800/80 space-y-3 select-none shadow-inner">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
            <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-wider">
              ID PPS Santri
            </span>
            <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
              {item.id_pps}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {santriData?.nama || "Santri"}
              </p>
              <p className="text-xs font-mono text-gray-400 truncate">
                {santriData?.kelas || "-"}  {santriData?.tingkatan || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Input Alasan Dispensasi */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-medium text-gray-300">
            Alasan / Keterangan Dispensasi <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            placeholder="Contoh: Sakit Atau Pulang"
            className="w-full px-4 py-3 bg-gray-950/70 border border-gray-800 rounded-2xl text-white font-mono text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/50 transition-all duration-200"
            required
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
            disabled={isPending || !alasan.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-mono text-xs font-semibold rounded-2xl shadow-lg shadow-purple-600/25 active:scale-95 transition-all border border-purple-400/30"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Dispensasi</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
};