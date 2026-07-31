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

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setProgressPercent(0);
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

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const expectedName = `${year}-${month}-${day}-database`;
    const uploadedFileName = file.name.substring(0, file.name.lastIndexOf("."));

    if (uploadedFileName !== expectedName) {
      showError(
        `Nama berkas "${file.name}" tidak sesuai tanggal hari ini. Wajib bernama: ${expectedName}.xlsx`,
        "Nama Berkas Tidak Valid"
      );
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
        throw new Error("File Excel tidak berisi data ID PPS yang valid.");
      }

      setParsedRows(mapped);
    } catch (err: any) {
      showError(
        err.message || "Gagal membaca berkas Excel. Pastikan format file sesuai.",
        "Gagal Membaca File"
      );
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

    try {
      const report = await syncExcelToPocketBase(parsedRows, (processed, total) => {
        const pct = Math.round((processed / total) * 100);
        setProgressPercent(pct);
      });

      onSuccess(report);
      handleCloseModal();
    } catch (err: any) {
      showError(
        err.message || "Terjadi kesalahan saat memproses transaksi database.",
        "Gagal Sinkronisasi"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Sinkronisasi Master Database via Excel"
      icon={<FileSpreadsheet className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-xl"
    >
      {/* 🔮 KUNCI STABILITAS UI: TINGGI DILOCK 'h-[280px]' & 'justify-between' */}
      <div className="h-[280px] flex flex-col justify-between py-1 px-1 font-mono text-xs select-none">
        
        {/* 1. HEADER INFO FORMAT TANGGAL (Tinggi Tetap) */}
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between text-indigo-300 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Format Wajib:{" "}
              <b className="text-white">
                {new Date().toISOString().slice(0, 10)}-database.xlsx
              </b>
            </span>
          </div>
        </div>

        {/* 2. AREA TENGAH: UPLOAD / PREVIEW (Presisi mengisi sisa ruang) */}
        <div className="flex-1 flex flex-col justify-center my-2">
          {parsedRows.length === 0 ? (
            <div
              onClick={() => !isParsing && fileInputRef.current?.click()}
              className="h-full border-2 border-dashed border-gray-800 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-gray-950/40 hover:bg-indigo-500/[0.02] cursor-pointer transition-all duration-200 group"
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
                <div className="flex flex-col items-center space-y-2">
                  <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                  <p className="text-gray-400">Menganalisis berkas Excel...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Klik untuk Unggah Berkas Excel Database
                    </p>
                    <p className="text-gray-500 text-[10px] mt-0.5">Format: .XLSX / .XLS</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full p-4 rounded-2xl bg-gray-950/80 border border-gray-800 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-white text-xs truncate">{selectedFile?.name}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">
                      {parsedRows.length.toLocaleString("id-ID")} Santri Siap Disinkronkan
                    </p>
                  </div>
                </div>
                {!isSyncing && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors shrink-0"
                    title="Ganti Berkas"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* PROGRESS BAR SLOT */}
              <div className="py-2">
                {isSyncing ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        Menyinkronkan Database...
                      </span>
                      <span className="font-bold text-white">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-900 border border-gray-800 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-150"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-emerald-400/90 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-center font-bold">
                    ✓ Berkas Valid & Siap Diproses
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. FOOTER ACTIONS (Tinggi Tetap) */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-800/80 shrink-0">
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExecuteSync}
            disabled={parsedRows.length === 0 || isSyncing}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all border border-indigo-400/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mulai Sinkronisasi ({parsedRows.length} Data)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </BaseModal>
  );
};