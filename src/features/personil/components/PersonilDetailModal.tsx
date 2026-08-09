// src/features/personil/components/PersonilDetailModal.tsx
import React, { useState, useEffect } from "react";
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
  const [displayPersonil, setDisplayPersonil] = useState<PersonilWithExpand | null>(personil);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (personil) {
      setDisplayPersonil(personil);
      setImageError(false);
    }
  }, [personil]);

  if (!displayPersonil) return null;

  const santri = displayPersonil.expand?.santri;

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
      icon={<ShieldCheck className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 py-1 px-1 font-mono text-xs select-none no-scrollbar">
        <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-r from-gray-900/90 via-indigo-950/40 to-gray-900/90 p-5 shadow-xl backdrop-blur-xl">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative w-32 h-40 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 border-2 border-indigo-400/30 shrink-0 overflow-hidden group">
              {fotoUrl && !imageError ? (
                <img
                  src={fotoUrl}
                  alt={santri?.nama || "Foto Personil"}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="font-sans font-extrabold text-5xl leading-none uppercase select-none drop-shadow-md">
                  {santri?.nama ? santri.nama.charAt(0) : "?"}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2 min-w-0 font-sans pt-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold font-mono text-[11px]">
                  ID PPS: {displayPersonil.id_pps || "-"}
                </span>

                <StatusBadge
                  variant={displayPersonil.status_aktif ? "success" : "danger"}
                  icon={displayPersonil.status_aktif ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  dot
                >
                  {displayPersonil.status_aktif ? "Aktif" : "Nonaktif"}
                </StatusBadge>
              </div>

              <h2 className="text-xl font-bold text-white truncate">
                {santri?.nama || "Tanpa Nama"}
              </h2>

              <p className="text-amber-300 font-bold font-mono text-xs truncate">
                Jabatan: {displayPersonil.jabatan_tibkam || "Anggota"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2.5 shadow-inner">
            <div className="flex items-center gap-2 border-b border-gray-800/80 pb-2 text-indigo-400 font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>Akademik & Domisili Pesantren</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-gray-500 block text-[10px]">Tingkatan</span>
                <span className="font-bold text-gray-200">{santri?.tingkatan || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Kelas / Ruang</span>
                <span className="font-bold text-gray-200">
                  {santri?.kelas || "-"} {santri?.ruang_kelas ? `(${santri.ruang_kelas})` : ""}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Kompleks Domisili</span>
                <span className="font-bold text-amber-300">{santri?.domisili || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Status Domisili</span>
                <span className="font-bold text-purple-300">{santri?.status_domisili || "-"}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2.5 shadow-inner">
            <div className="flex items-center gap-2 border-b border-gray-800/80 pb-2 text-purple-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Atribut Keanggotaan Tibkam</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Jabatan Operasional</span>
                <span className="font-bold text-amber-300 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  {displayPersonil.jabatan_tibkam || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status Keanggotaan</span>
                <span className="font-bold text-emerald-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                  {displayPersonil.status_aktif ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>

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

          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-2.5 shadow-inner md:col-span-2">
            <div className="flex items-center gap-2 border-b border-gray-800/80 pb-2 text-amber-400 font-bold">
              <Users className="w-4 h-4" />
              <span>Informasi Wali Santri</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans text-xs">
              <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 space-y-1">
                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">Nama Wali</span>
                <p className="font-bold text-white truncate">{santri?.nama_wali || "-"}</p>
              </div>

              <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 space-y-1">
                <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">Kontak Wali</span>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                  <Phone className="w-3 h-3" />
                  <span>{santri?.kontak_wali || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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