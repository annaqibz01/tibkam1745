// src/components/rambut/ManagePeriodeModal.tsx
import React, { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { HijriText } from "@/components/shared/HijriText";
import type {
  PeriodeRambutResponse,
  PeriodeRambutStatusPeriodeOptions,
} from "@/types/pocketbase-types";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Check,
  Eye,
  Loader2,
  CalendarDays,
  Sparkles,
  Trash2,
  AlertTriangle,
  Moon,
  PlusCircle,
} from "lucide-react";

interface ManagePeriodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodeList: PeriodeRambutResponse[];
  isLoading: boolean;
  selectedPeriodeId?: string;
  onSelectPeriode: (periode: PeriodeRambutResponse) => void;
  onUpdateStatus: (
    periodeId: string,
    status: PeriodeRambutStatusPeriodeOptions
  ) => void;
  isUpdatingStatus: boolean;
  onDeletePeriode: (periodeId: string) => void;
  isDeletingPeriode: boolean;
  onOpenCreateModal: () => void;
}

export const ManagePeriodeModal: React.FC<ManagePeriodeModalProps> = ({
  isOpen,
  onClose,
  periodeList,
  isLoading,
  selectedPeriodeId,
  onSelectPeriode,
  onUpdateStatus,
  isUpdatingStatus,
  onDeletePeriode,
  isDeletingPeriode,
  onOpenCreateModal,
}) => {
  // State Konfirmasi Pop-up Hapus Periode
  const [periodeToDelete, setPeriodeToDelete] = useState<PeriodeRambutResponse | null>(null);

  const getStatusBadge = (status?: PeriodeRambutStatusPeriodeOptions) => {
    switch (status) {
      case "aktif":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Aktif
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-gray-800 text-gray-400 border border-gray-700 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-gray-500" />
            Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
            <Clock className="w-3 h-3 text-amber-400" />
            Draft
          </span>
        );
    }
  };

  const handleConfirmDelete = () => {
    if (periodeToDelete) {
      onDeletePeriode(periodeToDelete.id);
      setPeriodeToDelete(null);
    }
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Kelola Daftar Periode Setor Rambut"
        icon={<CalendarDays className="w-5 h-5 text-indigo-400" />}
        maxWidth="max-w-4xl"
      >
        {/* ✨ Ditambahkan px-6 pb-6 pt-2 agar isi modal tidak mepet ke pinggir */}
        <div className="space-y-4 px-6 pb-6 pt-2 select-none flex flex-col min-h-0">
          {/* TOP TOOLBAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-950/80 border border-gray-800 shrink-0">
            <div className="text-xs font-mono text-gray-400 leading-relaxed">
              Pilih periode untuk ditinjau antreannya atau ubah status siklus operasional.
            </div>
            <button
              type="button"
              disabled={isUpdatingStatus || isDeletingPeriode}
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-mono font-bold shadow-md transition-all active:scale-95 border border-indigo-400/30 shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-indigo-100" />
              <span>Buat Periode Baru</span>
            </button>
          </div>

          {/* CONTAINER TABEL PERIODE */}
          <div className="border border-gray-800/80 rounded-2xl overflow-hidden bg-gray-950/60 shadow-inner flex flex-col">
            <div className="overflow-x-auto overflow-y-auto max-h-[340px] custom-scrollbar">
              <table className="w-full min-w-[700px] text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-[10px] uppercase sticky top-0 z-20 backdrop-blur-md">
                    <th className="px-4 py-3 w-12 text-center bg-gray-950">#</th>
                    <th className="px-4 py-3 min-w-[170px] bg-gray-950">Nama Periode</th>
                    <th className="px-4 py-3 min-w-[210px] text-center bg-gray-950">Rentang Hijriyah</th>
                    <th className="px-4 py-3 w-28 text-center bg-gray-950">Status</th>
                    <th className="px-4 py-3 w-56 text-center bg-gray-950">Aksi & Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 bg-gray-900/20">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={`skel-per-${idx}`} className="animate-pulse">
                        <td className="px-4 py-3.5 text-center">
                          <div className="h-3.5 bg-gray-800/60 rounded w-4 mx-auto" />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="h-3.5 bg-gray-800/60 rounded w-32" />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="h-5 bg-gray-800/60 rounded-lg w-44 mx-auto" />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="h-5 bg-gray-800/60 rounded-full w-16 mx-auto" />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="h-6 bg-gray-800/60 rounded-xl w-36 mx-auto" />
                        </td>
                      </tr>
                    ))
                  ) : periodeList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-mono text-xs">
                        Belum ada periode setor yang terdaftar di sistem.
                      </td>
                    </tr>
                  ) : (
                    periodeList.map((p, index) => {
                      const isBeingInspected = selectedPeriodeId === p.id;
                      const isAktif = p.status_periode === "aktif";
                      const isSelesai = p.status_periode === "selesai";

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors hover:bg-indigo-500/[0.04] ${
                            isBeingInspected ? "bg-indigo-500/10 border-l-2 border-indigo-400" : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-center text-gray-500 font-mono">
                            {index + 1}
                          </td>

                          <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>{p.nama_periode}</span>
                              {isBeingInspected && (
                                <span className="text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                                  Ditinjau
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 🌙 TAMPILAN RENTANG HIJRIYAH */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-amber-300">
                              <Moon className="w-3 h-3 text-amber-400 shrink-0" />
                              <HijriText date={p.tanggal_mulai} /> – <HijriText date={p.tanggal_selesai} />
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {getStatusBadge(p.status_periode)}
                          </td>

                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Tombol Tinjau */}
                              <button
                                type="button"
                                onClick={() => onSelectPeriode(p)}
                                disabled={isBeingInspected || isUpdatingStatus || isDeletingPeriode}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isBeingInspected
                                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 cursor-default"
                                    : "bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-indigo-500/40 active:scale-95"
                                }`}
                                title="Tampilkan antrean periode ini di halaman utama"
                              >
                                <Eye className="w-3 h-3 text-indigo-400" />
                                <span>{isBeingInspected ? "Ditinjau" : "Tinjau"}</span>
                              </button>

                              {/* Tombol Aktifkan */}
                              {!isAktif && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateStatus(p.id, "aktif")}
                                  disabled={isUpdatingStatus || isDeletingPeriode}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Jadikan sebagai Periode Aktif Utama"
                                >
                                  {isUpdatingStatus ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Play className="w-3 h-3 text-emerald-400" />
                                  )}
                                  <span>Aktifkan</span>
                                </button>
                              )}

                              {/* Tombol Selesaikan */}
                              {isAktif && !isSelesai && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateStatus(p.id, "selesai")}
                                  disabled={isUpdatingStatus || isDeletingPeriode}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="Tutup & Selesaikan Periode Ini"
                                >
                                  {isUpdatingStatus ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3 text-gray-400" />
                                  )}
                                  <span>Selesaikan</span>
                                </button>
                              )}

                              {/* Tombol Hapus Periode */}
                              <button
                                type="button"
                                onClick={() => setPeriodeToDelete(p)}
                                disabled={isDeletingPeriode || isUpdatingStatus}
                                className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Hapus Periode Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end pt-2 border-t border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdatingStatus || isDeletingPeriode}
              className="px-4 py-2 rounded-2xl border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 text-xs font-mono font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tutup
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 🚨 POP-UP PERINGATAN KONFIRMASI HAPUS PERIODE */}
      <BaseModal
        isOpen={!!periodeToDelete}
        onClose={() => {
          if (!isDeletingPeriode) setPeriodeToDelete(null);
        }}
        title="Konfirmasi Hapus Periode"
        icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
        maxWidth="max-w-md"
      >
        {/* ✨ Ditambahkan px-6 pb-6 pt-2 pada modal konfirmasi */}
        <div className="space-y-4 px-6 pb-6 pt-2 text-center font-mono select-none">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-white">
              Hapus Periode "{periodeToDelete?.nama_periode}"?
            </h4>
            <p className="text-xs text-rose-300/90 leading-relaxed bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
              ⚠️ Peringatan: Tindakan ini akan <strong>menghapus secara permanen</strong> seluruh data antrean wajib setor di dalamnya!
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="button"
              disabled={isDeletingPeriode}
              onClick={() => setPeriodeToDelete(null)}
              className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeletingPeriode}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeletingPeriode ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Ya, Hapus Permanen</span>
            </button>
          </div>
        </div>
      </BaseModal>
    </>
  );
};