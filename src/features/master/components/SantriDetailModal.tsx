// src/features/master/components/SantriDetailModal.tsx
import React, { useState, useEffect } from "react";
import { BaseModal, StatusBadge } from "@/components/shared";
import type { MasterResponse } from "@/types/pocketbase-types";
import {
  User,
  GraduationCap,
  Home,
  MapPin,
  Users,
  Phone,
  FileText,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";

interface SantriDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  santri: MasterResponse | null;
}

export const SantriDetailModal: React.FC<SantriDetailModalProps> = ({
  isOpen,
  onClose,
  santri,
}) => {
  const [displaySantri, setDisplaySantri] = useState<MasterResponse | null>(santri);

  useEffect(() => {
    if (santri) {
      setDisplaySantri(santri);
    }
  }, [santri]);

  if (!displaySantri) return null;

  const alamatLengkap =
    [displaySantri.desa, displaySantri.kecamatan, displaySantri.kabupaten, displaySantri.provinsi]
      .map((v) => v?.toString().trim())
      .filter(Boolean)
      .join(", ") || "-";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Data Santri"
      icon={<User className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 py-1 px-1 font-mono text-xs select-none no-scrollbar">
        {/* 1. HERO PROFILE CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-r from-gray-900/90 via-indigo-950/40 to-gray-900/90 p-5 shadow-xl backdrop-blur-xl">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30 border border-indigo-400/30 shrink-0">
              {displaySantri.nama ? displaySantri.nama.charAt(0).toUpperCase() : "?"}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0 font-sans">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold font-mono text-[11px]">
                  ID PPS: {displaySantri.id_pps || "-"}
                </span>

                <StatusBadge
                  variant={displaySantri.status_aktif ? "success" : "danger"}
                  icon={displaySantri.status_aktif ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  dot
                >
                  {displaySantri.status_aktif ? "Aktif" : "Nonaktif"}
                </StatusBadge>

                {displaySantri.status_domisili && (
                  <StatusBadge variant="purple">
                    Domisili: {displaySantri.status_domisili}
                  </StatusBadge>
                )}
              </div>

              <h2 className="text-lg font-bold text-white truncate">
                {displaySantri.nama || "Tanpa Nama"}
              </h2>

              <p className="text-gray-400 text-[11px] truncate">
                {displaySantri.nama_akte ? `Nama Akte: ${displaySantri.nama_akte}` : "Nama Akte sesuai nama induk"}
              </p>
            </div>
          </div>
        </div>

        {/* 2. GRID DETAILS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* SEKSI A: AKADEMIK & PESANTREN */}
          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2.5 shadow-inner">
            <div className="flex items-center gap-2 border-b border-gray-800/80 pb-2 text-indigo-400 font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>Akademik & Domisili Pesantren</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500 block text-[10px]">Tingkatan</span>
                <span className="font-bold text-gray-200">{displaySantri.tingkatan || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Kelas / Ruang</span>
                <span className="font-bold text-gray-200">
                  {displaySantri.kelas || "-"} {displaySantri.ruang_kelas ? `(${displaySantri.ruang_kelas})` : ""}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">No. Absen</span>
                <span className="font-bold text-gray-200">{displaySantri.noabsen || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Kompleks Domisili</span>
                <span className="font-bold text-amber-300">{displaySantri.domisili || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">No. Pendaftaran</span>
                <span className="font-bold text-gray-300">{displaySantri.nomor_daftar || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Tgl. Pendaftaran</span>
                <span className="font-bold text-gray-300">{displaySantri.tanggal_daftar || "-"}</span>
              </div>
            </div>
          </div>

          {/* SEKSI B: IDENTITAS BERKAS KEPENDUDUKAN */}
          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2.5 shadow-inner">
            <div className="flex items-center gap-2 border-b border-gray-800/80 pb-2 text-purple-400 font-bold">
              <FileText className="w-4 h-4" />
              <span>Identitas Berkas Kependudukan</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">NIK Santri</span>
                <span className="font-bold text-gray-200 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  {displaySantri.nik || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">No. Kartu Keluarga (KK)</span>
                <span className="font-bold text-gray-200 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  {displaySantri.kk || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">NISN</span>
                <span className="font-bold text-gray-200 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  {displaySantri.nisn || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* SEKSI C: ALAMAT DAERAH ASAL */}
          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2.5 shadow-inner md:col-span-2">
            <div className="flex items-center gap-2 border-b border-gray-800/80 pb-2 text-emerald-400 font-bold">
              <MapPin className="w-4 h-4" />
              <span>Alamat Daerah Asal Santri</span>
            </div>

            <div className="flex items-start gap-2 text-gray-300 font-sans text-xs">
              <Home className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{alamatLengkap}</p>
            </div>
          </div>

          {/* SEKSI D: DATA ORANG TUA & WALI */}
          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2.5 shadow-inner md:col-span-2">
            <div className="flex items-center gap-2 border-b border-gray-800/80 pb-2 text-amber-400 font-bold">
              <Users className="w-4 h-4" />
              <span>Informasi Orang Tua & Wali Santri</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
              <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 space-y-1">
                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">Ayah Kandung</span>
                <p className="font-bold text-white truncate">{displaySantri.nama_ayah || "-"}</p>
                <p className="text-[10px] font-mono text-gray-400">NIK: {displaySantri.nik_ayah || "-"}</p>
              </div>

              <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 space-y-1">
                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">Ibu Kandung</span>
                <p className="font-bold text-white truncate">{displaySantri.nama_ibu || "-"}</p>
                <p className="text-[10px] font-mono text-gray-400">NIK: {displaySantri.nik_ibu || "-"}</p>
              </div>

              <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 space-y-1">
                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">Wali Santri</span>
                <p className="font-bold text-amber-300 truncate">{displaySantri.nama_wali || "-"}</p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <Phone className="w-3 h-3" />
                  <span>{displaySantri.kontak_wali || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SEKSI E: CATATAN UPDATE SISTEM */}
          {(displaySantri.alasan_update_status || displaySantri.keterangan_update_domisi) && (
            <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2 shadow-inner md:col-span-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-gray-800/80 pb-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Catatan Histori Sistem / Sinkronisasi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
                {displaySantri.alasan_update_status && (
                  <div className="p-2.5 rounded-xl bg-gray-900/50 border border-gray-800">
                    <span className="text-[10px] font-mono text-gray-500 block">Alasan Update Status</span>
                    <p className="text-gray-300 mt-0.5">{displaySantri.alasan_update_status}</p>
                  </div>
                )}
                {displaySantri.keterangan_update_domisi && (
                  <div className="p-2.5 rounded-xl bg-gray-900/50 border border-gray-800">
                    <span className="text-[10px] font-mono text-gray-500 block">Ket. Update Domisili</span>
                    <p className="text-amber-300 mt-0.5">{displaySantri.keterangan_update_domisi}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. FOOTER ACTION */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white font-mono text-xs font-bold transition-all active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </BaseModal>
  );
};