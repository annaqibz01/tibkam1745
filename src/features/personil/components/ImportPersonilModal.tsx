// src/features/personil/components/ImportPersonilModal.tsx
import React from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { useImportPersonil } from "../hooks/useImportPersonil";
import type { PersonilSyncReport } from "../utils/importPersonilExcel";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Loader2,
  Download,
  RefreshCw,
  User,
  AlertCircle,
  PlusCircle,
  RefreshCw as UpdateIcon,
  MinusCircle,
} from "lucide-react";

interface ImportPersonilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (report: PersonilSyncReport) => void;
}

export const ImportPersonilModal: React.FC<ImportPersonilModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    fileInputRef,
    selectedFile,
    parsedRows,
    isParsing,
    isSubmitting,
    errorMessage,
    createRowsCount,
    updateRowsCount,
    skipRowsCount,
    totalProcessable,
    handleFileUpload,
    handleExecuteImport,
    handleReset,
    handleDownloadTemplate,
  } = useImportPersonil(onSuccess);

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Import Personil Tibkam via Excel"
      icon={<FileSpreadsheet className="w-5 h-5 text-emerald-400" />}
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col h-[370px] overflow-hidden justify-between space-y-3 pt-1 text-sm no-scrollbar">

        {/* 1. TOP BAR INFO & TEMPLATE DOWNLOAD */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-950/80 border border-gray-800 shrink-0">
          <div className="text-xs text-gray-400">
            Kolom WAJIB: <b className="text-indigo-400 font-mono">ID PPS</b> dan <b className="text-purple-400 font-mono">JABATAN</b>.
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-900 border border-gray-800 hover:border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-all active:scale-95 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Template</span>
          </button>
        </div>

        {/* 2. AREA TENGAH */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {parsedRows.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-full border-2 border-dashed border-gray-800 hover:border-indigo-500/50 rounded-3xl flex flex-col items-center justify-center p-4 text-center bg-gray-950/40 hover:bg-indigo-500/[0.02] cursor-pointer transition-all duration-200 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isParsing}
              />
              {isParsing ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-xs font-mono text-gray-400">
                    Menganalisis berkas personil Tibkam...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Klik untuk Unggah File Excel Personil</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">Format didukung: .XLSX, .XLS</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col space-y-2 overflow-hidden">
              {/* SUMMARY STATS BAR */}
              <div className="flex items-center justify-between p-2 rounded-2xl bg-gray-950/90 border border-gray-800 shrink-0 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white truncate max-w-[180px] sm:max-w-[240px]">
                    {selectedFile?.name}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{parsedRows.length} Baris</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    {createRowsCount > 0 && (
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        +{createRowsCount} Baru
                      </span>
                    )}
                    {updateRowsCount > 0 && (
                      <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        ~{updateRowsCount} Update
                      </span>
                    )}
                    {skipRowsCount > 0 && (
                      <span className="text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md">
                        ={skipRowsCount} Lewat
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
                    title="Ganti file Excel"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* TABEL PREVIEW */}
              <div className="flex-1 min-h-0 border border-gray-800 rounded-2xl overflow-hidden bg-gray-950/60 shadow-inner flex flex-col">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <table className="w-full text-xs text-left border-collapse font-mono">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-800 text-gray-400 text-[10px] uppercase sticky top-0 z-10 select-none">
                        <th className="px-3.5 py-2 w-10 text-center">#</th>
                        <th className="px-3.5 py-2 w-28">ID PPS</th>
                        <th className="px-3.5 py-2 min-w-[150px]">Nama Santri</th>
                        <th className="px-3.5 py-2 min-w-[130px]">Jabatan Excel</th>
                        <th className="px-3.5 py-2 min-w-[150px] text-left">Aksi Sinkronisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 bg-gray-900/20">
                      {parsedRows.map((row) => (
                        <tr key={row.rowNum} className="hover:bg-indigo-500/[0.02] transition-colors">
                          <td className="px-3.5 py-2 text-center text-gray-500">{row.rowNum}</td>
                          <td className="px-3.5 py-2 font-bold text-indigo-300 whitespace-nowrap">
                            {row.idPps ? (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                                {row.idPps}
                              </span>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>
                          <td className="px-3.5 py-2 font-semibold">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                              <span
                                className={
                                  row.namaSantri === "Santri Tidak Ditemukan"
                                    ? "text-amber-400/80 italic text-[11px] flex items-center gap-1"
                                    : "text-white"
                                }
                              >
                                {row.namaSantri === "Santri Tidak Ditemukan" && (
                                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                                )}
                                {row.namaSantri}
                              </span>
                            </div>
                          </td>
                          <td className="px-3.5 py-2 text-amber-300 font-medium">{row.jabatan || "-"}</td>
                          <td className="px-3.5 py-2 whitespace-nowrap">
                            {row.status === "success" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> {row.message}
                              </span>
                            ) : row.status === "skipped" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-400 bg-gray-800/80 border border-gray-700">
                                <MinusCircle className="w-3 h-3 text-gray-500" /> {row.message}
                              </span>
                            ) : row.syncAction === "create" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                <PlusCircle className="w-3 h-3" /> Tambah Baru
                              </span>
                            ) : row.syncAction === "update" ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20"
                                title={row.message}
                              >
                                <UpdateIcon className="w-3 h-3 text-amber-400" /> Update Jabatan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20">
                                <AlertTriangle className="w-3 h-3 shrink-0" /> <span>{row.message || "Eror"}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. ERROR BANNER */}
        {errorMessage && (
          <div className="p-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* 4. TOMBOL AKSI BAWAH */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-800/80 shrink-0">
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white font-mono text-xs font-bold transition-all"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => handleExecuteImport(onClose)}
            disabled={totalProcessable === 0 || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all border border-emerald-400/30 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Batch Transaction...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Proses Import ({totalProcessable} Data)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};