// src/pages/Master.tsx
import { useState } from "react";
import { useMaster } from "../hooks/useMaster";
import {
  syncExcelToPocketBase,
  type ExcelSantriRow,
} from "@/utils/syncExcelToPocketBase";
import * as XLSX from "xlsx";
import MasterHeader from "../components/MasterHeader";
import SyncReportBanner from "../components/SyncReportBanner";
import ImportErrorBanner from "../components/ImportErrorBanner";
import MasterToolbar from "../components/MasterToolbar";
import MasterTable from "../components/MasterTable";
import MasterPagination from "../components/MasterPagination";
const PER_PAGE = 15;

export default function MasterPage() {
  // ---- State ----
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "aktif" | "nonaktif"
  >("aktif");
  const [isImporting, setIsImporting] = useState(false);

  // State Laporan Sukses & Laporan Eror Kustom
  const [syncReport, setSyncReport] = useState<{
    inserted: number;
    updated: number;
    softDeleted: number;
    skipped: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null); // ✨ State baru penampung pesan eror

  // ---- Hooks ----
  const { useMasterList, useToggleStatusMaster } = useMaster();

  const {
    data: masterData,
    isLoading,
    isFetching,
    refetch,
  } = useMasterList({ page, perPage: PER_PAGE, search, statusFilter });

  const toggleMutation = useToggleStatusMaster();

  const items = masterData?.items ?? [];
  const totalItems = masterData?.totalItems ?? 0;
  const totalPages = masterData?.totalPages ?? 0;

  // ---- Handlers ----
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: "all" | "aktif" | "nonaktif") => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 📅 Hitung Cetakan Waktu Tanggal Hari Ini
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const expectedName = `${year}-${month}-${day}-database`;
    const uploadedFileName = file.name.substring(0, file.name.lastIndexOf("."));

    if (uploadedFileName !== expectedName) {
      setImportError(
        `Nama berkas tidak sesuai dengan tanggal hari ini.\n\n` +
          `💡 Wajib: ${expectedName}.xlsx\n` +
          `📂 Berkas Anda: ${file.name}`,
      );
      e.target.value = "";
      return;
    }

    setIsImporting(true);
    setSyncReport(null);
    setImportError(null); // Bersihkan riwayat eror lama jika ada

    try {
      // 🚀 OPTIMASI UTAMA: Menggunakan modern ArrayBuffer API langsung dari objek File
      // Menghilangkan instansiasi `new FileReader()` dan penumpukan callback `reader.onload`
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" }); // type diubah menjadi 'array'

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData: unknown[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });

      const mapped: ExcelSantriRow[] = (rawData as any[])
        .filter((row: any) => {
          const idPps = row["ID PPS"]?.toString().trim();
          return idPps && idPps.length > 0;
        })
        .map((row: any) => ({
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
          alasan_update_status:
            row["Alasan Update Status"]?.toString().trim() ?? "",
          keterangan_update_domisi:
            row["Ket. Update Domisili"]?.toString().trim() ?? "",
        }));

      const report = await syncExcelToPocketBase(mapped);
      setSyncReport(report);
      refetch();
    } catch (err) {
      console.error("Gagal sinkronisasi berkas:", err);
      setImportError(
        "Struktur dokumen Excel tidak valid, rusak, atau gagal diproses oleh sistem. Periksa kembali berkas Anda.",
      );
    } finally {
      // Blok finally terpadu menjamin state loading & input element selalu dibersihkan dengan aman
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const handleToggleStatus = (
    id: string,
    currentStatus: boolean,
    nama: string,
  ) => {
    const msg = currentStatus
      ? `Nonaktifkan santri "${nama}"? Santri tidak akan muncul di daftar aktif.`
      : `Aktifkan kembali santri "${nama}"?`;
    if (window.confirm(msg)) {
      toggleMutation.mutate({ id, currentStatus });
    }
  };

  return (
    <div className="bg-gray-950 min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <MasterHeader
        isImporting={isImporting}
        onExcelImport={handleExcelImport}
      />

      {/* 🟢 Pasangkan onClose ke setSyncReport */}
      <SyncReportBanner
        report={syncReport}
        onClose={() => setSyncReport(null)}
      />

      {/* 🔴 Pastikan ini sudah terpasang rapi ke setImportError */}
      <ImportErrorBanner
        message={importError}
        onClose={() => setImportError(null)}
      />

      <MasterToolbar
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        onRefresh={refetch}
        isListLoading={isLoading || isFetching}
      />

      <MasterTable
        items={items}
        isLoading={isLoading}
        isFetching={isFetching}
        isPendingToggle={toggleMutation.isPending}
        onToggleStatus={handleToggleStatus}
        page={page}
        perPage={PER_PAGE}
      />

      <MasterPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={PER_PAGE}
        onPageChange={setPage}
      />
    </div>
  );
}
