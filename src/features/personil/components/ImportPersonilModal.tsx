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
      icon={<FileSpreadsheet className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col h-[340px] overflow-hidden justify-between space-y-2.5 font-sans select-none text-xs">
        {/* 1. Top Bar Template Download */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0">
          <span className="text-zinc-400 text-xs">
            Kolom Wajib: <b className="text-indigo-400 font-mono">ID PPS</b> & <b className="text-purple-400 font-mono">JABATAN</b>.
          </span>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-emerald-400 text-xs font-mono font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Template</span>
          </button>
        </div>

        {/* 2. Area Tengah */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {parsedRows.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-full border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg flex flex-col items-center justify-center p-4 text-center bg-zinc-950/50 hover:bg-zinc-800/60 cursor-pointer transition-colors"
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
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  <p className="text-xs text-zinc-400">Menganalisis berkas personil...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">Pilih Berkas Excel Personil</p>
                    <p className="text-zinc-500 text-[11px] mt-0.5">Format didukung: .XLSX, .XLS</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col space-y-2 overflow-hidden">
              {/* Summary Stats Bar */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0 font-mono text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-zinc-200 truncate max-w-[160px] sm:max-w-[220px]">
                    {selectedFile?.name}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">{parsedRows.length} Baris</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono">
                    {createRowsCount > 0 && (
                      <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        +{createRowsCount} Baru
                      </span>
                    )}
                    {updateRowsCount > 0 && (
                      <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        ~{updateRowsCount} Update
                      </span>
                    )}
                    {skipRowsCount > 0 && (
                      <span className="text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                        ={skipRowsCount} Lewat
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Ganti file Excel"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tabel Preview */}
              <div className="flex-1 min-h-0 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950 shadow-inner flex flex-col">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-xs text-left border-collapse font-mono">
                    <thead>
                      <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[10px] uppercase sticky top-0 z-10">
                        <th className="px-3 py-2 w-10 text-center font-sans">#</th>
                        <th className="px-3 py-2 w-28 font-sans">ID PPS</th>
                        <th className="px-3 py-2 min-w-[140px] font-sans">Nama Santri</th>
                        <th className="px-3 py-2 min-w-[120px] font-sans">Jabatan Excel</th>
                        <th className="px-3 py-2 min-w-[140px] text-left font-sans">Aksi Sinkronisasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/20">
                      {parsedRows.map((row) => (
                        <tr key={row.rowNum} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="px-3 py-1.5 text-center text-zinc-500">{row.rowNum}</td>
                          <td className="px-3 py-1.5 font-bold text-indigo-300 whitespace-nowrap">
                            {row.idPps ? (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                                {row.idPps}
                              </span>
                            ) : (
                              <span className="text-zinc-600">-</span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 font-semibold font-sans">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-zinc-500 shrink-0" />
                              <span
                                className={
                                  row.namaSantri === "Santri Tidak Ditemukan"
                                    ? "text-amber-400 italic text-[11px] flex items-center gap-1"
                                    : "text-zinc-200"
                                }
                              >
                                {row.namaSantri === "Santri Tidak Ditemukan" && (
                                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                                )}
                                {row.namaSantri}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-1.5 text-amber-300 font-medium">{row.jabatan || "-"}</td>
                          <td className="px-3 py-1.5 whitespace-nowrap">
                            {row.status === "success" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> {row.message}
                              </span>
                            ) : row.status === "skipped" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 bg-zinc-800 border border-zinc-700">
                                <MinusCircle className="w-3 h-3 text-zinc-500" /> {row.message}
                              </span>
                            ) : row.syncAction === "create" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                <PlusCircle className="w-3 h-3" /> Tambah Baru
                              </span>
                            ) : row.syncAction === "update" ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20"
                                title={row.message}
                              >
                                <UpdateIcon className="w-3 h-3 text-amber-400" /> Update Jabatan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20">
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

        {/* 3. Error Banner */}
        {errorMessage && (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* 4. Tombol Aksi Bawah (Tinggi h-9) */}
        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={handleCloseModal}
            className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => handleExecuteImport(onClose)}
            disabled={totalProcessable === 0 || isSubmitting}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-colors active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses Batch...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Proses Import ({totalProcessable} Data)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};