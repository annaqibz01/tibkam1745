// src/features/rambut/components/ManagePeriodeModal.tsx
import React, { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { useHijriByDate } from "@/features/kalender";
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
  Trash2,
  AlertTriangle,
  Moon,
  PlusCircle,
  HelpCircle,
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

/**
 * 🌙 HELPER SUB-COMPONENT: Format Tanggal Hijriyah Ringkas (DD-MM-YYYY)
 * Contoh: "07-02-1448" -> Ukuran string 100% terkunci fixed-width!
 */
const HijriShortText: React.FC<{ date: string | Date | null | undefined }> = ({
  date,
}) => {
  const { data, isLoading } = useHijriByDate(date);

  if (!date) return <>--/--/----</>;
  if (isLoading) return <span className="animate-pulse">..-..-....</span>;
  if (!data) return <>--/--/----</>;

  const dd = String(data.tanggal_hijri || 0).padStart(2, "0");
  const mm = String(data.bulan_hijri_angka || 0).padStart(2, "0");
  const yyyy = data.tahun_hijri || "----";

  return <>{`${dd}-${mm}-${yyyy}`}</>;
};

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
  // State Pop-up Konfirmasi Hapus Periode
  const [periodeToDelete, setPeriodeToDelete] = useState<PeriodeRambutResponse | null>(null);

  // State Pop-up Konfirmasi Ubah Status Periode
  const [statusTarget, setStatusTarget] = useState<{
    periode: PeriodeRambutResponse;
    newStatus: PeriodeRambutStatusPeriodeOptions;
  } | null>(null);

  const getStatusBadge = (status?: PeriodeRambutStatusPeriodeOptions) => {
    switch (status) {
      case "aktif":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Aktif
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-gray-800 text-gray-400 border border-gray-700 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-gray-500" />
            Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
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

  const handleConfirmStatusUpdate = () => {
    if (statusTarget) {
      onUpdateStatus(statusTarget.periode.id, statusTarget.newStatus);
      setStatusTarget(null);
    }
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Kelola Daftar Periode Setor Rambut"
        icon={<CalendarDays className="w-5 h-5 text-indigo-400" />}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3 px-1 sm:px-2 pb-3 pt-1 select-none flex flex-col min-h-0 font-mono">
          {/* TOP TOOLBAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-gray-950/80 border border-gray-800 shrink-0">
            <div className="text-xs text-gray-400 leading-relaxed">
              Pilih periode untuk ditinjau atau ubah status operasional.
            </div>
            <button
              type="button"
              disabled={isUpdatingStatus || isDeletingPeriode}
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all active:scale-95 border border-indigo-400/30 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-100" />
              <span>Buat Periode Baru</span>
            </button>
          </div>

          {/* CONTAINER TABEL PERIODE (TINGGI FIXED TERKUNCI ISTIMEWA) */}
          <div className="border border-gray-800/80 rounded-2xl overflow-hidden bg-gray-950/60 shadow-inner flex flex-col">
            {/* 🎯 KUNCI UTAMA: Menggunakan h-[280px] agar tinggi modal konsisten & tidak melompat */}
            <div className="overflow-y-auto h-[280px] custom-scrollbar">
              <table className="w-full text-xs text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-[10px] uppercase sticky top-0 z-20 backdrop-blur-md">
                    <th className="px-2 py-2.5 w-8 text-center bg-gray-950">#</th>
                    <th className="px-2.5 py-2.5 bg-gray-950">Nama Periode</th>
                    <th className="px-2 py-2.5 text-center bg-gray-950">Rentang Hijriyah</th>
                    <th className="px-2 py-2.5 w-20 text-center bg-gray-950">Status</th>
                    <th className="px-2 py-2.5 w-[220px] text-center bg-gray-950">Aksi & Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 bg-gray-900/20">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={`skel-per-${idx}`} className="animate-pulse">
                        <td className="px-2 py-2 text-center">
                          <div className="h-3 bg-gray-800/60 rounded w-4 mx-auto" />
                        </td>
                        <td className="px-2.5 py-2">
                          <div className="h-3 bg-gray-800/60 rounded w-28" />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="h-4 bg-gray-800/60 rounded-lg w-36 mx-auto" />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="h-4 bg-gray-800/60 rounded-full w-14 mx-auto" />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="h-5 bg-gray-800/60 rounded-xl w-32 mx-auto" />
                        </td>
                      </tr>
                    ))
                  ) : periodeList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center text-gray-500 text-xs">
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
                          <td className="px-2 py-2 text-center text-gray-500">
                            {index + 1}
                          </td>

                          {/* NAMA PERIODE */}
                          <td className="px-2.5 py-2 font-bold text-white whitespace-nowrap">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate max-w-[130px] sm:max-w-[170px]">{p.nama_periode}</span>
                            </div>
                          </td>

                          {/* RENTANG HIJRIYAH FORMAT ANGKA RINGKAS (DD-MM-YYYY) */}
                          <td className="px-2 py-2 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 text-amber-300 text-[11px] font-mono font-bold tracking-tight">
                              <Moon className="w-3 h-3 text-amber-400 shrink-0" />
                              <span><HijriShortText date={p.tanggal_mulai} /></span>
                              <span className="text-amber-500/60">–</span>
                              <span><HijriShortText date={p.tanggal_selesai} /></span>
                            </div>
                          </td>

                          <td className="px-2 py-2 text-center whitespace-nowrap">
                            {getStatusBadge(p.status_periode)}
                          </td>

                          {/* AKSI & KONTROL */}
                          <td className="px-2 py-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* SLOT 1: TINJAU / DITINJAU */}
                              <button
                                type="button"
                                onClick={() => onSelectPeriode(p)}
                                disabled={isBeingInspected || isUpdatingStatus || isDeletingPeriode}
                                className={`w-[78px] h-7 inline-flex items-center justify-center gap-1 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isBeingInspected
                                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 cursor-default"
                                    : "bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-indigo-500/40 active:scale-95"
                                }`}
                                title="Tampilkan antrean periode ini di halaman utama"
                              >
                                <Eye className="w-3 h-3 text-indigo-400 shrink-0" />
                                <span>{isBeingInspected ? "Ditinjau" : "Tinjau"}</span>
                              </button>

                              {/* SLOT 2: AKTIFKAN / SELESAIKAN */}
                              <div className="w-[90px] flex justify-center">
                                {!isAktif ? (
                                  <button
                                    type="button"
                                    onClick={() => setStatusTarget({ periode: p, newStatus: "aktif" })}
                                    disabled={isUpdatingStatus || isDeletingPeriode}
                                    className="w-full h-7 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Jadikan sebagai Periode Aktif Utama"
                                  >
                                    {isUpdatingStatus ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Play className="w-3 h-3 text-emerald-400 shrink-0" />
                                    )}
                                    <span>Aktifkan</span>
                                  </button>
                                ) : !isSelesai ? (
                                  <button
                                    type="button"
                                    onClick={() => setStatusTarget({ periode: p, newStatus: "selesai" })}
                                    disabled={isUpdatingStatus || isDeletingPeriode}
                                    className="w-full h-7 inline-flex items-center justify-center gap-1 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-[10px] font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Tutup & Selesaikan Periode Ini"
                                  >
                                    {isUpdatingStatus ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3 text-gray-400 shrink-0" />
                                    )}
                                    <span>Selesaikan</span>
                                  </button>
                                ) : (
                                  <div className="w-full" />
                                )}
                              </div>

                              {/* SLOT 3: TOMBOL HAPUS */}
                              <button
                                type="button"
                                onClick={() => setPeriodeToDelete(p)}
                                disabled={isDeletingPeriode || isUpdatingStatus}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
              className="px-4 py-1.5 rounded-xl border border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tutup
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 🚨 1. POP-UP KONFIRMASI UBAH STATUS PERIODE */}
      <BaseModal
        isOpen={!!statusTarget}
        onClose={() => {
          if (!isUpdatingStatus) setStatusTarget(null);
        }}
        title="Konfirmasi Ubah Status Periode"
        icon={<HelpCircle className="w-5 h-5 text-indigo-400" />}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 px-4 pb-4 pt-1 text-center font-mono select-none">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
            statusTarget?.newStatus === "aktif"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-gray-800 border border-gray-700 text-gray-300"
          }`}>
            {statusTarget?.newStatus === "aktif" ? (
              <Play className="w-6 h-6 text-emerald-400" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-gray-400" />
            )}
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-white">
              {statusTarget?.newStatus === "aktif"
                ? `Aktifkan Periode "${statusTarget?.periode.nama_periode}"?`
                : `Selesaikan Periode "${statusTarget?.periode.nama_periode}"?`}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/60 p-3 rounded-2xl border border-gray-800 text-left font-sans">
              {statusTarget?.newStatus === "aktif" ? (
                <>
                  Mengaktifkan periode ini akan otomatis menonaktifkan periode lain yang sedang aktif. Seluruh transaksi POS dan scan kartu akan dialihkan ke periode <strong>{statusTarget?.periode.nama_periode}</strong>.
                </>
              ) : (
                <>
                  Menyelesaikan periode ini akan menutup seluruh siklus perapian rambut untuk periode <strong>{statusTarget?.periode.nama_periode}</strong>. Transaksi baru tidak dapat dilakukan setelah diselesaikan.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => setStatusTarget(null)}
              className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmStatusUpdate}
              disabled={isUpdatingStatus}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                statusTarget?.newStatus === "aktif"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/20"
              }`}
            >
              {isUpdatingStatus ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : statusTarget?.newStatus === "aktif" ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Ya, Ubah Status</span>
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 🚨 2. POP-UP KONFIRMASI HAPUS PERIODE */}
      <BaseModal
        isOpen={!!periodeToDelete}
        onClose={() => {
          if (!isDeletingPeriode) setPeriodeToDelete(null);
        }}
        title="Konfirmasi Hapus Periode"
        icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 px-4 pb-4 pt-1 text-center font-mono select-none">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-white">
              Hapus Periode "{periodeToDelete?.nama_periode}"?
            </h4>
            <p className="text-xs text-rose-300/90 leading-relaxed bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 font-sans text-left">
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