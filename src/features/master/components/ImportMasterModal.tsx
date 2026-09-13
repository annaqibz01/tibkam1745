// src/features/master/components/ImportMasterModal.tsx
import React, { useState, useRef } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { useToast } from "@/context/ToastContext";
import * as XLSX from "xlsx";
import {
  syncExcelToPocketBase,
  type ExcelSantriRow,
} from "../utils/syncExcelToPocketBase";
import {
  FileSpreadsheet,
  UploadCloud,
  Loader2,
  FileCheck,
  RefreshCw,
  CheckCircle2,
  Database,
  AlertCircle,
} from "lucide-react";

interface ImportMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (report: {
    inserted: number;
    updated: number;
    softDeleted: number;
    skipped: number;
  }) => void;
}

export const ImportMasterModal: React.FC<ImportMasterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ExcelSantriRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [inlineError, setInlineError] = useState<string>("");

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setProgressPercent(0);
    setInlineError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCloseModal = () => {
    if (isSyncing) return;
    handleReset();
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInlineError("");
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const expectedName = `${year}-${month}-${day}-database`;
    const uploadedFileName = file.name.substring(0, file.name.lastIndexOf("."));

    if (uploadedFileName !== expectedName) {
      setInlineError(`Nama berkas tidak sesuai tanggal hari ini. Wajib: ${expectedName}.xlsx`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

      const mapped: ExcelSantriRow[] = rawData
        .filter((row) => {
          const idPps = row["ID PPS"]?.toString().trim();
          return idPps && idPps.length > 0;
        })
        .map((row) => ({
          id_pps: row["ID PPS"]?.toString().trim() ?? "",
          nomor_daftar: row["Nomor Daftar"]?.toString().trim() ?? "",
          tanggal_daftar: row["Tanggal Daftar"]?.toString().trim() ?? "",
          nama: row["Nama"]?.toString().trim() ?? "",
          nama_akte: row["Nama Akte"]?.toString().trim() ?? "",
          desa: row["Desa"]?.toString().trim() ?? "",
          kecamatan: row["Kecamatan"]?.toString().trim() ?? "",
          kabupaten: row["Kabupaten"]?.toString().trim() ?? "",
          provinsi: row["Provinsi"]?.toString().trim() ?? "",
          nik: row["NIK"]?.toString().trim() ?? "",
          kk: row["KK"]?.toString().trim() ?? "",
          nisn: row["NISN"]?.toString().trim() ?? "",
          nik_ayah: row["NIK Ayah"]?.toString().trim() ?? "",
          nama_ayah: row["Nama Ayah"]?.toString().trim() ?? "",
          nik_ibu: row["NIK Ibu"]?.toString().trim() ?? "",
          nama_ibu: row["Nama Ibu"]?.toString().trim() ?? "",
          nik_wali: row["NIK Wali"]?.toString().trim() ?? "",
          nama_wali: row["Nama Wali"]?.toString().trim() ?? "",
          kontak_wali: row["Kontak Wali"]?.toString().trim() ?? "",
          status_domisili: row["Status Domisili"]?.toString().trim() ?? "",
          domisili: row["Domisili"]?.toString().trim() ?? "",
          kelas: row["Kelas"]?.toString().trim() ?? "",
          tingkatan: row["Tingkat"]?.toString().trim() ?? "",
          noabsen: row["NoAbsen"]?.toString().trim() ?? "",
          ruang_kelas: row["Ruang Kelas"]?.toString().trim() ?? "",
          alasan_update_status: row["Alasan Update Status"]?.toString().trim() ?? "",
          keterangan_update_domisi: row["Ket. Update Domisili"]?.toString().trim() ?? "",
        }));

      if (mapped.length === 0) {
        throw new Error("Berkas Excel tidak berisi data ID PPS yang valid.");
      }

      setParsedRows(mapped);
    } catch (err: any) {
      setInlineError(err.message || "Gagal membaca berkas Excel. Pastikan format file sesuai.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteSync = async () => {
    if (parsedRows.length === 0 || isSyncing) return;

    setIsSyncing(true);
    setProgressPercent(0);
    setInlineError("");

    try {
      const report = await syncExcelToPocketBase(parsedRows, (processed, total) => {
        const pct = Math.round((processed / total) * 100);
        setProgressPercent(pct);
      });

      onSuccess(report);
      handleCloseModal();
    } catch (err: any) {
      setInlineError(err.message || "Terjadi kesalahan saat memproses transaksi database.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Sinkronisasi Master via Excel"
      icon={<FileSpreadsheet className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-lg"
    >
      {/* 
        KUNCI STABILITAS UI: 
        Ketinggian dikunci permanen h-[300px] dengan flex-col justify-between.
        Kotak modal dijamin 100% tidak melompat atas-bawah saat file dipilih!
      */}
      <div className="h-[300px] flex flex-col justify-between font-sans select-none text-xs">
        {/* 1. Header Info Format Berkas */}
        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between text-zinc-300 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-[11px]">
              Format Wajib:{" "}
              <b className="text-zinc-100 font-mono">
                {new Date().toISOString().slice(0, 10)}-database.xlsx
              </b>
            </span>
          </div>
        </div>

        {/* Inline Error jika nama salah */}
        {inlineError && (
          <div className="p-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] flex items-center gap-1.5 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{inlineError}</span>
          </div>
        )}

        {/* 2. Area Dropzone & Preview (Ketinggian Terkunci h-[140px]) */}
        <div className="h-[140px] shrink-0">
          {parsedRows.length === 0 ? (
            <div
              onClick={() => !isParsing && fileInputRef.current?.click()}
              className="h-full border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center text-center bg-zinc-950/40 hover:bg-zinc-850 cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isParsing}
              />
              {isParsing ? (
                <div className="flex flex-col items-center space-y-1.5">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  <p className="text-zinc-400 text-xs">Menganalisis berkas Excel...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1.5">
                  <div className="p-2.5 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-200">
                    Pilih Berkas Excel Database Santri
                  </p>
                  <p className="text-zinc-500 text-[11px]">Format: .XLSX / .XLS</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-200 text-xs truncate">{selectedFile?.name}</p>
                    <p className="text-zinc-500 text-[11px]">
                      {parsedRows.length.toLocaleString("id-ID")} Data Santri Terbaca
                    </p>
                  </div>
                </div>
                {!isSyncing && (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={handleReset}
                    className="p-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Ganti Berkas"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress Bar Slot */}
              <div className="py-1">
                {isSyncing ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                        Menyinkronkan data...
                      </span>
                      <span className="font-mono text-zinc-100 font-semibold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-150"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 text-center font-medium">
                    ✓ Berkas valid & siap disinkronkan
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Footer Actions (Tinggi h-9) */}
        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-800 shrink-0">
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={isSyncing}
            className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExecuteSync}
            disabled={parsedRows.length === 0 || isSyncing}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mulai Sinkronisasi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};