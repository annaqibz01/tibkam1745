// src/features/master/components/SantriDetailModal.tsx
import React, { useState } from "react";
import { BaseModal, StatusBadge } from "@/components/shared";
import type { MasterResponse } from "@/types/pocketbase-types";
import { pb } from "@/lib/pocketbase";
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
  Image as ImageIcon,
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
  // State error foto diisolasi per URL/ID
  const [imageError, setImageError] = useState(false);

  // Jika tidak ada data yang dipilih, jangan render apa pun
  if (!santri) return null;

  const alamatLengkap =
    [santri.desa, santri.kecamatan, santri.kabupaten, santri.provinsi]
      .map((v) => v?.toString().trim())
      .filter(Boolean)
      .join(", ") || "-";

  const fotoUrl = santri.foto
    ? pb.getFileUrl(santri, santri.foto)
    : null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Data Santri"
      icon={<User className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3 font-sans select-none text-xs">
        {/* Profile Card Ringkas */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            
            {/* 
              KUNCI SOLUSI: key={santri.id} 
              Memaksa React meremount elemen gambar seketika saat ID santri berganti,
              menghilangkan 100% flicker/glitch foto santri sebelumnya.
            */}
            <div 
              key={santri.id} 
              className="relative w-24 h-32 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 overflow-hidden"
            >
              {fotoUrl && !imageError ? (
                <img
                  src={fotoUrl}
                  alt={santri.nama || "Foto Santri"}
                  className="w-full h-full object-cover object-top animate-in fade-in duration-150"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="font-bold text-2xl text-zinc-500 uppercase select-none">
                  {santri.nama ? santri.nama.charAt(0) : "?"}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  ID: {santri.id_pps || "-"}
                </span>

                <StatusBadge
                  variant={santri.status_aktif ? "success" : "danger"}
                  icon={santri.status_aktif ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  dot
                >
                  {santri.status_aktif ? "Aktif" : "Nonaktif"}
                </StatusBadge>

                {santri.status_domisili && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">
                    Domisili {santri.status_domisili}
                  </span>
                )}

                {santri.foto_subfolder && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-850 border border-zinc-700/60 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {santri.foto_subfolder}
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-white truncate select-text">
                {santri.nama || "Tanpa Nama"}
              </h2>

              <p className="text-xs text-zinc-400 truncate">
                {santri.nama_akte ? `Nama Akte: ${santri.nama_akte}` : "Sesuai nama induk"}
              </p>
            </div>
          </div>
        </div>

        {/* Grid Data 2 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Seksi A: Akademik & Pesantren */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 space-y-1.5">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 text-xs font-semibold text-zinc-200">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
              <span>Akademik & Domisili</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block">Tingkatan</span>
                <span className="font-medium text-zinc-200">{santri.tingkatan || "-"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Kelas / Ruang</span>
                <span className="font-medium text-zinc-200">
                  {santri.kelas || "-"} {santri.ruang_kelas ? `(${santri.ruang_kelas})` : ""}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">No. Absen</span>
                <span className="font-mono font-medium text-zinc-200">{santri.noabsen || "-"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Kompleks Domisili</span>
                <span className="font-medium text-zinc-200">{santri.domisili || "-"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">No. Pendaftaran</span>
                <span className="font-mono text-zinc-400">{santri.nomor_daftar || "-"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Tgl. Pendaftaran</span>
                <span className="font-mono text-zinc-400">{santri.tanggal_daftar || "-"}</span>
              </div>
            </div>
          </div>

          {/* Seksi B: Identitas Kependudukan */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 space-y-1.5">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 text-xs font-semibold text-zinc-200">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Identitas Kependudukan</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">NIK Santri</span>
                <span className="font-mono text-zinc-200">{santri.nik || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">No. Kartu Keluarga</span>
                <span className="font-mono text-zinc-200">{santri.kk || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">NISN</span>
                <span className="font-mono text-zinc-200">{santri.nisn || "-"}</span>
              </div>
            </div>
          </div>

          {/* Seksi C: Alamat Asal Santri */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 space-y-1 md:col-span-2">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 text-xs font-semibold text-zinc-200">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Alamat Asal</span>
            </div>
            <div className="flex items-start gap-1.5 text-xs text-zinc-300 pt-0.5">
              <Home className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed select-text">{alamatLengkap}</p>
            </div>
          </div>

          {/* Seksi D: Data Orang Tua & Wali */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 space-y-1.5 md:col-span-2">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 text-xs font-semibold text-zinc-200">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>Orang Tua & Wali</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-zinc-900 rounded border border-zinc-800 space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Ayah Kandung</span>
                <p className="font-medium text-white truncate select-text">{santri.nama_ayah || "-"}</p>
                <p className="text-[10px] font-mono text-zinc-500">NIK: {santri.nik_ayah || "-"}</p>
              </div>

              <div className="p-2 bg-zinc-900 rounded border border-zinc-800 space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Ibu Kandung</span>
                <p className="font-medium text-white truncate select-text">{santri.nama_ibu || "-"}</p>
                <p className="text-[10px] font-mono text-zinc-500">NIK: {santri.nik_ibu || "-"}</p>
              </div>

              <div className="p-2 bg-zinc-900 rounded border border-zinc-800 space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Wali Santri</span>
                <p className="font-medium text-zinc-200 truncate select-text">{santri.nama_wali || "-"}</p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                  <Phone className="w-3 h-3 text-zinc-500" />
                  <span className="select-text">{santri.kontak_wali || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seksi E: Catatan Histori Sistem */}
          {(santri.alasan_update_status || santri.keterangan_update_domisi) && (
            <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 space-y-1 md:col-span-2">
              <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 text-xs font-semibold text-zinc-400">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
                <span>Catatan Histori Pembaruan</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                {santri.alasan_update_status && (
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Alasan Update Status</span>
                    <p className="text-zinc-300 mt-0.5">{santri.alasan_update_status}</p>
                  </div>
                )}
                {santri.keterangan_update_domisi && (
                  <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 block">Ket. Update Domisili</span>
                    <p className="text-amber-300 mt-0.5">{santri.keterangan_update_domisi}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="flex items-center justify-end pt-2.5 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </BaseModal>
  );
};