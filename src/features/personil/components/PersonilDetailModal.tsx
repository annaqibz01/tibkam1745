// src/features/personil/components/PersonilDetailModal.tsx
import React, { useState } from "react";
import { BaseModal, StatusBadge } from "@/components/shared";
import type { PersonilWithExpand } from "../hooks/usePersonil";
import { pb } from "@/lib/pocketbase";
import {
  GraduationCap,
  Home,
  MapPin,
  Users,
  Phone,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";

interface PersonilDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  personil: PersonilWithExpand | null;
}

export const PersonilDetailModal: React.FC<PersonilDetailModalProps> = ({
  isOpen,
  onClose,
  personil,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!personil) return null;

  const santri = personil.expand?.santri;

  const alamatLengkap =
    [santri?.desa, santri?.kecamatan, santri?.kabupaten, santri?.provinsi]
      .map((v) => v?.toString().trim())
      .filter(Boolean)
      .join(", ") || "-";

  const fotoUrl = santri?.foto ? pb.getFileUrl(santri, santri.foto) : null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Personil Tibkam"
      icon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-xl"
    >
      <div className="space-y-3 font-sans select-none text-xs">
        {/* Profile Card Ringkas */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
            {/* Foto Santri (Key ditambahkan untuk mencegah glitch foto sebelumnya) */}
            <div
              key={personil.id}
              className="relative w-24 h-32 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 overflow-hidden"
            >
              {fotoUrl && !imageError ? (
                <img
                  src={fotoUrl}
                  alt={santri?.nama || "Foto Personil"}
                  className="w-full h-full object-cover object-top animate-in fade-in duration-150"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="font-bold text-2xl text-zinc-500 uppercase select-none">
                  {santri?.nama ? santri.nama.charAt(0) : "?"}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  ID: {personil.id_pps || "-"}
                </span>

                <StatusBadge
                  variant={personil.status_aktif ? "success" : "danger"}
                  icon={personil.status_aktif ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  dot
                >
                  {personil.status_aktif ? "Aktif" : "Nonaktif"}
                </StatusBadge>
              </div>

              <h2 className="text-base font-bold text-white truncate select-text">
                {santri?.nama || "Tanpa Nama"}
              </h2>

              <p className="text-xs font-semibold text-amber-300 font-mono">
                Jabatan: {personil.jabatan_tibkam || "Anggota"}
              </p>
            </div>
          </div>
        </div>

        {/* Grid Data 2 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Akademik & Pesantren */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 space-y-1.5">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 text-xs font-semibold text-zinc-200">
              <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
              <span>Akademik & Domisili</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block">Tingkatan</span>
                <span className="font-medium text-zinc-200">{santri?.tingkatan || "-"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Kelas / Ruang</span>
                <span className="font-medium text-zinc-200">
                  {santri?.kelas || "-"} {santri?.ruang_kelas ? `(${santri.ruang_kelas})` : ""}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Kompleks Domisili</span>
                <span className="font-medium text-amber-300">{santri?.domisili || "-"}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Status Domisili</span>
                <span className="font-medium text-purple-300">{santri?.status_domisili || "-"}</span>
              </div>
            </div>
          </div>

          {/* Atribut Keanggotaan */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 space-y-1.5">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 text-xs font-semibold text-zinc-200">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Atribut Tibkam</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Jabatan Operasional</span>
                <span className="font-semibold text-amber-300 font-mono">
                  {personil.jabatan_tibkam || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Status Keanggotaan</span>
                <span className="font-medium text-emerald-400">
                  {personil.status_aktif ? "Aktif Bertugas" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>

          {/* Alamat Asal */}
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

          {/* Informasi Wali Santri */}
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/40 space-y-1.5 md:col-span-2">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 text-xs font-semibold text-zinc-200">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>Wali Santri</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Nama Wali</span>
                <p className="font-medium text-white truncate select-text">{santri?.nama_wali || "-"}</p>
              </div>

              <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Kontak Wali</span>
                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 mt-0.5">
                  <Phone className="w-3 h-3 text-zinc-500" />
                  <span className="select-text">{santri?.kontak_wali || "-"}</span>
                </div>
              </div>
            </div>
          </div>
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