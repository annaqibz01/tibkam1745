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
  onUpdateStatus: (periodeId: string, status: PeriodeRambutStatusPeriodeOptions) => void;
  isUpdatingStatus: boolean;
  onDeletePeriode: (periodeId: string) => void;
  isDeletingPeriode: boolean;
  onOpenCreateModal: () => void;
}

const HijriShortText: React.FC<{ date: string | Date | null | undefined }> = ({ date }) => {
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
  const [periodeToDelete, setPeriodeToDelete] = useState<PeriodeRambutResponse | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    periode: PeriodeRambutResponse;
    newStatus: PeriodeRambutStatusPeriodeOptions;
  } | null>(null);

  const getStatusBadge = (status?: PeriodeRambutStatusPeriodeOptions) => {
    switch (status) {
      case "aktif":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Aktif
          </span>
        );
      case "selesai":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-zinc-500" />
            Selesai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
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
        icon={<CalendarDays className="w-4 h-4 text-indigo-400" />}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3 px-1 sm:px-2 pb-3 pt-1 select-none flex flex-col min-h-0 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0">
            <div className="text-xs text-zinc-400 leading-relaxed">
              Pilih periode untuk ditinjau atau ubah status operasional.
            </div>
            <button
              type="button"
              disabled={isUpdatingStatus || isDeletingPeriode}
              onClick={() => { onClose(); onOpenCreateModal(); }}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat Periode Baru</span>
            </button>
          </div>

          <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/60 flex flex-col">
            <div className="overflow-y-auto h-[280px] custom-scrollbar">
              <table className="w-full text-xs text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[10px] uppercase select-none">
                    <th className="px-2 py-2.5 w-8 text-center bg-zinc-950">#</th>
                    <th className="px-2.5 py-2.5 bg-zinc-950">Nama Periode</th>
                    <th className="px-2 py-2.5 text-center bg-zinc-950">Rentang Hijriyah</th>
                    <th className="px-2 py-2.5 w-20 text-center bg-zinc-950">Status</th>
                    <th className="px-2 py-2.5 w-[220px] text-center bg-zinc-950">Aksi & Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/20">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={`skel-per-${idx}`} className="animate-pulse">
                        <td className="px-2 py-2 text-center"><div className="h-3 bg-zinc-800 rounded w-4 mx-auto" /></td>
                        <td className="px-2.5 py-2"><div className="h-3 bg-zinc-800 rounded w-28" /></td>
                        <td className="px-2 py-2 text-center"><div className="h-4 bg-zinc-800 rounded-lg w-36 mx-auto" /></td>
                        <td className="px-2 py-2 text-center"><div className="h-4 bg-zinc-800 rounded-full w-14 mx-auto" /></td>
                        <td className="px-2 py-2 text-center"><div className="h-5 bg-zinc-800 rounded-lg w-32 mx-auto" /></td>
                      </tr>
                    ))
                  ) : periodeList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center text-zinc-500 text-xs">
                        Belum ada periode setor yang terdaftar di sistem.
                      </td>
                    </tr>
                  ) : (
                    periodeList.map((p, index) => {
                      const isBeingInspected = selectedPeriodeId === p.id;
                      const isAktif = p.status_periode === "aktif";
                      const isSelesai = p.status_periode === "selesai";
                      return (
                        <tr key={p.id} className={`transition-colors hover:bg-zinc-800/40 ${isBeingInspected ? "bg-indigo-500/10" : ""}`}>
                          <td className="px-2 py-2 text-center text-zinc-500">{index + 1}</td>
                          <td className="px-2.5 py-2 font-bold text-white whitespace-nowrap">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate max-w-[130px] sm:max-w-[170px]">{p.nama_periode}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                              <Moon className="w-3 h-3 text-amber-400 shrink-0" />
                              <span><HijriShortText date={p.tanggal_mulai} /></span>
                              <span className="text-amber-500/60">–</span>
                              <span><HijriShortText date={p.tanggal_selesai} /></span>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">{getStatusBadge(p.status_periode)}</td>
                          <td className="px-2 py-2 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onSelectPeriode(p)}
                                disabled={isBeingInspected || isUpdatingStatus || isDeletingPeriode}
                                className={`w-[78px] h-7 inline-flex items-center justify-center gap-1 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isBeingInspected
                                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40"
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-indigo-500/40"
                                }`}
                                title="Tampilkan antrean periode ini di halaman utama"
                              >
                                <Eye className="w-3 h-3 text-indigo-400 shrink-0" />
                                <span>{isBeingInspected ? "Ditinjau" : "Tinjau"}</span>
                              </button>
                              <div className="w-[90px] flex justify-center">
                                {!isAktif ? (
                                  <button
                                    type="button"
                                    onClick={() => setStatusTarget({ periode: p, newStatus: "aktif" })}
                                    disabled={isUpdatingStatus || isDeletingPeriode}
                                    className="w-full h-7 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Jadikan sebagai Periode Aktif Utama"
                                  >
                                    {isUpdatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 text-emerald-400 shrink-0" />}
                                    <span>Aktifkan</span>
                                  </button>
                                ) : !isSelesai ? (
                                  <button
                                    type="button"
                                    onClick={() => setStatusTarget({ periode: p, newStatus: "selesai" })}
                                    disabled={isUpdatingStatus || isDeletingPeriode}
                                    className="w-full h-7 inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[10px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Tutup & Selesaikan Periode Ini"
                                  >
                                    {isUpdatingStatus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-zinc-400 shrink-0" />}
                                    <span>Selesaikan</span>
                                  </button>
                                ) : (
                                  <div className="w-full" />
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setPeriodeToDelete(p)}
                                disabled={isDeletingPeriode || isUpdatingStatus}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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

          <div className="flex items-center justify-end pt-2 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdatingStatus || isDeletingPeriode}
              className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tutup
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Pop-up Konfirmasi Ubah Status */}
      <BaseModal
        isOpen={!!statusTarget}
        onClose={() => !isUpdatingStatus && setStatusTarget(null)}
        title="Konfirmasi Ubah Status Periode"
        icon={<HelpCircle className="w-4 h-4 text-indigo-400" />}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 px-4 pb-4 pt-1 text-center font-sans select-none">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto ${
            statusTarget?.newStatus === "aktif" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-zinc-800 border border-zinc-700 text-zinc-300"
          }`}>
            {statusTarget?.newStatus === "aktif" ? <Play className="w-6 h-6 text-emerald-400" /> : <CheckCircle2 className="w-6 h-6 text-zinc-400" />}
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-white">
              {statusTarget?.newStatus === "aktif" ? `Aktifkan Periode "${statusTarget?.periode.nama_periode}"?` : `Selesaikan Periode "${statusTarget?.periode.nama_periode}"?`}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 text-left">
              {statusTarget?.newStatus === "aktif" ? (
                <>Mengaktifkan periode ini akan otomatis menonaktifkan periode lain yang sedang aktif. Seluruh transaksi POS dan scan kartu akan dialihkan ke periode <strong>{statusTarget?.periode.nama_periode}</strong>.</>
              ) : (
                <>Menyelesaikan periode ini akan menutup seluruh siklus perapian rambut untuk periode <strong>{statusTarget?.periode.nama_periode}</strong>. Transaksi baru tidak dapat dilakukan setelah diselesaikan.</>
              )}
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => setStatusTarget(null)}
              className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmStatusUpdate}
              disabled={isUpdatingStatus}
              className={`inline-flex items-center gap-1.5 h-9 px-4 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 ${
                statusTarget?.newStatus === "aktif" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : statusTarget?.newStatus === "aktif" ? <Play className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
              <span>Ya, Ubah Status</span>
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Pop-up Konfirmasi Hapus Periode */}
      <BaseModal
        isOpen={!!periodeToDelete}
        onClose={() => !isDeletingPeriode && setPeriodeToDelete(null)}
        title="Konfirmasi Hapus Periode"
        icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 px-4 pb-4 pt-1 text-center font-sans select-none">
          <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-white">Hapus Periode "{periodeToDelete?.nama_periode}"?</h4>
            <p className="text-xs text-rose-300/90 leading-relaxed bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-left">
              ⚠️ Peringatan: Tindakan ini akan <strong>menghapus secara permanen</strong> seluruh data antrean wajib setor di dalamnya!
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              disabled={isDeletingPeriode}
              onClick={() => setPeriodeToDelete(null)}
              className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeletingPeriode}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {isDeletingPeriode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Ya, Hapus Permanen</span>
            </button>
          </div>
        </div>
      </BaseModal>
    </>
  );
};