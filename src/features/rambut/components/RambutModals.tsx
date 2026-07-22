// src/components/rambut/RambutModals.tsx
import React from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { CreatePeriodeModal } from "./CreatePeriodeModal";
import { ManagePeriodeModal } from "./ManagePeriodeModal";
import { ExecuteSetorModal } from "./ExecuteSetorModal";
import { ManagePengurusModal } from "./ManagePengurusModal";
import { DispensasiModal } from "./DispensasiModal";
import { RapidScanPosModal } from "./RapidScanPosModal";
import { ImportPengurusModal } from "./ImportPengurusModal";
import { RefreshCw, Loader2, Trash2, User, Wand2, Sparkles } from "lucide-react";
import type { useRambutPage } from "../hooks/useRambutPage";

type RambutModalsProps = ReturnType<typeof useRambutPage>;

export const RambutModals: React.FC<RambutModalsProps> = (p) => {
  // ✨ Pengecekan hasQueue lebih akurat berdasarkan total antrean statistik saat ini
  const hasQueue = p.stats.total > 0;
  const currentPeriodeNama = p.selectedPeriode?.nama_periode || p.activePeriode?.nama_periode || "Periode Aktif";

  return (
    <>
      <CreatePeriodeModal
        isOpen={p.activeModal === "CREATE_PERIODE"}
        onClose={() => p.setActiveModal(null)}
        onSubmit={p.handleCreatePeriode}
        isPending={p.isCreatePending}
      />

      <ManagePeriodeModal
        isOpen={p.activeModal === "MANAGE_PERIODE"}
        onClose={() => p.setActiveModal(null)}
        periodeList={p.periodeList}
        isLoading={p.isPeriodeListLoading}
        selectedPeriodeId={p.currentPeriodeId}
        onSelectPeriode={(periode) => {
          p.setSelectedPeriode(periode);
          p.setActiveModal(null);
          p.setPage(1);
        }}
        onUpdateStatus={p.handleUpdateStatusPeriode}
        isUpdatingStatus={p.isUpdateStatusPending}
        onDeletePeriode={p.handleDeletePeriode}
        isDeletingPeriode={p.isDeletePeriodePending}
        onOpenCreateModal={() => p.setActiveModal("CREATE_PERIODE")}
      />

      <ExecuteSetorModal
        isOpen={!!p.selectedExecuteItem}
        onClose={() => p.setSelectedExecuteItem(null)}
        item={p.selectedExecuteItem}
        onConfirm={p.handleConfirmSetor}
        isPending={p.isExecutePending}
      />

      <DispensasiModal
        isOpen={!!p.selectedDispensasiItem}
        onClose={() => p.setSelectedDispensasiItem(null)}
        item={p.selectedDispensasiItem}
        onConfirm={p.handleConfirmDispensasi}
        isPending={p.isDispensasiPending}
      />

      <ManagePengurusModal
        isOpen={p.activeModal === "MANAGE_PENGURUS"}
        onClose={() => p.setActiveModal(null)}
      />

      <RapidScanPosModal
        isOpen={p.activeModal === "POS"}
        onClose={() => p.setActiveModal(null)}
        periodeId={p.currentPeriodeId}
      />

      <ImportPengurusModal
        isOpen={p.activeModal === "IMPORT_PENGURUS"}
        onClose={() => p.setActiveModal(null)}
        onSuccessImport={p.refetchAll}
      />

      {/* POP-UP KONFIRMASI HAPUS PENGURUS */}
      <BaseModal
        isOpen={!!p.selectedDeletePengurus}
        onClose={() => !p.isDeletingPengurus && p.setSelectedDeletePengurus(null)}
        title="Konfirmasi Hapus Pengurus"
        icon={<Trash2 className="w-5 h-5 text-rose-400" />}
        maxWidth="max-w-md"
      >
        {p.selectedDeletePengurus && (
          <div className="space-y-4 px-6 pb-6 pt-2 select-none font-mono">
            <div className="p-4 rounded-2xl bg-gray-950/70 border border-rose-500/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-[10px] text-gray-400 uppercase">ID PPS Pengurus</span>
                <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                  {p.selectedDeletePengurus.id_pps}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate font-sans">
                    {p.selectedDeletePengurus.expand?.santri?.nama || "Pengurus / Petugas"}
                  </p>
                  <p className="text-xs text-purple-300">
                    {p.selectedDeletePengurus.jabatan || "Petugas Cukur"}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-rose-950/30 p-3 rounded-xl border border-rose-500/20 font-sans">
              Apakah Anda yakin ingin menghapus data petugas/pengurus ini dari sistem?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => p.setSelectedDeletePengurus(null)}
                disabled={p.isDeletingPengurus}
                className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={p.handleConfirmDeletePengurus}
                disabled={p.isDeletingPengurus}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-semibold rounded-xl border border-rose-400/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                {p.isDeletingPengurus ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Ya, Hapus Pengurus</span>
              </button>
            </div>
          </div>
        )}
      </BaseModal>

      {/* POP-UP GENERATE ATAU SMART SYNC */}
      <BaseModal
        isOpen={p.activeModal === "CONFIRM_GENERATE"}
        onClose={() => !p.isGeneratePending && p.setActiveModal(null)}
        title={hasQueue ? "Smart Sync Rekonsiliasi Antrean" : "Generate Antrean Periode"}
        icon={
          hasQueue ? (
            <RefreshCw className="w-5 h-5 text-purple-400" />
          ) : (
            /* ✨ Ikon Wand2 melambangkan Fitur Generate Otomatis */
            <Wand2 className="w-5 h-5 text-amber-400" />
          )
        }
        maxWidth="max-w-md"
      >
        <div className="space-y-4 px-6 pb-6 pt-2 text-center font-mono select-none">
          {/* Box Ikon Header */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
              hasQueue
                ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
            }`}
          >
            {hasQueue ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              /* ✨ Ikon Wand2 dengan Efek Pulse untuk Mode Generate */
              <Wand2 className="w-6 h-6 text-amber-300 animate-pulse" />
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">
              {hasQueue ? `Sync Antrean "${currentPeriodeNama}"?` : `Generate Antrean "${currentPeriodeNama}"?`}
            </h4>

            <p className="text-xs text-gray-300 leading-relaxed bg-gray-950/60 p-3.5 rounded-2xl border border-gray-800 text-left font-sans">
              {hasQueue ? (
                <>
                  Sistem akan melakukan rekonsiliasi data:
                  <br /><br />
                  • <strong className="text-emerald-400">Data Baru:</strong> Otomatis ditambahkan.<br />
                  • <strong className="text-red-400">Petugas di copot:</strong> Otomatis dihapus.<br />
                  • <strong className="text-indigo-300">Data Lama:</strong> <u className="underline">Tetap utuh</u>.
                </>
              ) : (
                <>
                  Sistem akan memindai seluruh santri aktif yang berdomisili pps (Aliyah, Kuliah Syariah) dan Pengurus/Petugas untuk membuat daftar antrean awal periode <strong>{currentPeriodeNama}</strong>.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <button
              type="button"
              disabled={p.isGeneratePending}
              onClick={() => p.setActiveModal(null)}
              className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={p.handleConfirmGenerateQueue}
              disabled={p.isGeneratePending}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all ${
                hasQueue
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20"
                  : "bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 shadow-amber-600/20"
              }`}
            >
              {p.isGeneratePending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : hasQueue ? (
                <RefreshCw className="w-3.5 h-3.5" />
              ) : (
                /* ✨ Ikon Sparkles pada tombol Generate */
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>{hasQueue ? "Jalankan Smart Sync" : "Proses Generate"}</span>
            </button>
          </div>
        </div>
      </BaseModal>
    </>
  );
};