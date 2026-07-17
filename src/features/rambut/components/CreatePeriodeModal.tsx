// src/components/rambut/CreatePeriodeModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { BaseModal } from "../../../components/shared/BaseModal";
import { CustomDatePickerHijriyah } from "../../../components/shared/CustomDatePickerHijriyah";
import { useTodayHijri } from "@/features/kalender";
import type { CreatePeriodePayload } from "../hooks/useRambut";
import {
  Calendar,
  Loader2,
  Save,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";

interface CreatePeriodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePeriodePayload) => void;
  isPending: boolean;
}

// 🌙 Daftar Nama Bulan Hijriyah Baku
const BULAN_HIJRI_OPTIONS = [
  { angka: 1, nama: "Muharram" },
  { angka: 2, nama: "Safar" },
  { angka: 3, nama: "Rabi'ul Awal" },
  { angka: 4, nama: "Rabi'ul Akhir" },
  { angka: 5, nama: "Jumadil Ula" },
  { angka: 6, nama: "Jumadil Akhir" },
  { angka: 7, nama: "Rajab" },
  { angka: 8, nama: "Sya'ban" },
  { angka: 9, nama: "Ramadhan" },
  { angka: 10, nama: "Syawwal" },
  { angka: 11, nama: "Dzulqa'dah" },
  { angka: 12, nama: "Dzulhijjah" },
] as const;

export const CreatePeriodeModal: React.FC<CreatePeriodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}) => {
  // 🌙 Fetch data Hijriyah hari ini dari database collection kalender_hijriyah
  const { data: todayHijri } = useTodayHijri();

  const [namaPeriode, setNamaPeriode] = useState("");
  const [bulanHijri, setBulanHijri] = useState<number>(1);
  const [tahunHijri, setTahunHijri] = useState<number>(1448);
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Cari objek nama bulan aktif berdasarkan angka
  const activeBulan = useMemo(() => {
    return (
      BULAN_HIJRI_OPTIONS.find((b) => b.angka === bulanHijri) ||
      BULAN_HIJRI_OPTIONS[0]
    );
  }, [bulanHijri]);

  // ✨ Auto Set Default Bulan & Tahun Hijriyah Hari Ini saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const defaultBulan = todayHijri?.bulan_hijri_angka || 1;
      const defaultTahun = todayHijri?.tahun_hijri || 1448;
      const defaultBulanObj =
        BULAN_HIJRI_OPTIONS.find((b) => b.angka === defaultBulan) ||
        BULAN_HIJRI_OPTIONS[0];

      setBulanHijri(defaultBulan);
      setTahunHijri(defaultTahun);
      setNamaPeriode(`Setoran ${defaultBulanObj.nama} ${defaultTahun} H`);
      setTglMulai("");
      setTglSelesai("");
      setLocalError(null);
    }
  }, [isOpen, todayHijri]);

  // 🔄 Function Handler Tambah/Kurang Bulan Hijriyah (dengan auto-rollover)
  const handlePrevBulan = () => {
    let nextBulan = bulanHijri - 1;
    let nextTahun = tahunHijri;

    if (nextBulan < 1) {
      nextBulan = 12;
      nextTahun -= 1;
    }

    setBulanHijri(nextBulan);
    setTahunHijri(nextTahun);

    const targetBulan =
      BULAN_HIJRI_OPTIONS.find((b) => b.angka === nextBulan) ||
      BULAN_HIJRI_OPTIONS[0];

    if (!namaPeriode || namaPeriode.startsWith("Setoran ")) {
      setNamaPeriode(`Setoran ${targetBulan.nama} ${nextTahun} H`);
    }
  };

  const handleNextBulan = () => {
    let nextBulan = bulanHijri + 1;
    let nextTahun = tahunHijri;

    if (nextBulan > 12) {
      nextBulan = 1;
      nextTahun += 1;
    }

    setBulanHijri(nextBulan);
    setTahunHijri(nextTahun);

    const targetBulan =
      BULAN_HIJRI_OPTIONS.find((b) => b.angka === nextBulan) ||
      BULAN_HIJRI_OPTIONS[0];

    if (!namaPeriode || namaPeriode.startsWith("Setoran ")) {
      setNamaPeriode(`Setoran ${targetBulan.nama} ${nextTahun} H`);
    }
  };

  // 🔄 Function Handler Tambah/Kurang Tahun Hijriyah
  const handleYearChange = (newYear: number) => {
    const safeYear = Math.max(1300, newYear);
    setTahunHijri(safeYear);

    if (!namaPeriode || namaPeriode.startsWith("Setoran ")) {
      setNamaPeriode(`Setoran ${activeBulan.nama} ${safeYear} H`);
    }
  };

  // 🛡️ PENGAMAN: Validasi Real-Time Tanggal Selesai < Tanggal Mulai
  const isDateInvalid = useMemo(() => {
    if (!tglMulai || !tglSelesai) return false;
    const start = new Date(tglMulai).getTime();
    const end = new Date(tglSelesai).getTime();
    return end < start;
  }, [tglMulai, tglSelesai]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!namaPeriode.trim()) {
      setLocalError("Nama periode wajib diisi.");
      return;
    }

    if (!tglMulai || !tglSelesai) {
      setLocalError("Tanggal mulai dan tanggal selesai wajib diisi.");
      return;
    }

    if (isDateInvalid) {
      setLocalError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      return;
    }

    onSubmit({
      nama_periode: namaPeriode.trim(),
      bulan_hijriyah_angka: bulanHijri,
      tahun_hijriyah: tahunHijri,
      tanggal_mulai: tglMulai,
      tanggal_selesai: tglSelesai,
      status_periode: "draft",
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Periode Setoran Baru"
      icon={<Calendar className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-xl" // Lapang dan longgar (tidak sesak)
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1 px-1 sm:px-4">
        
        {/* 🚨 BANNER PERINGATAN VALIDASI */}
        {(localError || isDateInvalid) && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              {localError || "Peringatan: Tanggal selesai tidak boleh lebih awal dari tanggal mulai!"}
            </span>
          </div>
        )}

        {/* NAMA PERIODE */}
        <div>
          <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
            Nama Periode
          </label>
          <input
            type="text"
            value={namaPeriode}
            onChange={(e) => {
              setNamaPeriode(e.target.value);
              if (localError) setLocalError(null);
            }}
            placeholder="Contoh: Setoran Muharram 1448 H"
            className="w-full h-[42px] px-4 bg-gray-950/60 border border-gray-800 rounded-2xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-inner transition-all"
            required
          />
        </div>

        {/* BULAN & TAHUN HIJRIYAH DENGAN KONTROL TAMBAH / KURANG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* BULAN HIJRIYAH (TAMBAH / KURANG + NAMA BULAN) */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
              Bulan Hijriyah Target
            </label>
            <div className="relative flex items-center h-[42px] bg-gray-950/60 border border-gray-800 rounded-2xl px-1.5 shadow-inner">
              <button
                type="button"
                onClick={handlePrevBulan}
                className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10"
                title="Bulan Sebelumnya"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 text-center font-mono text-xs font-bold text-amber-300 truncate px-2 select-none">
                {activeBulan.angka}. {activeBulan.nama}
              </div>

              <button
                type="button"
                onClick={handleNextBulan}
                className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10"
                title="Bulan Selanjutnya"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TAHUN HIJRIYAH (TAMBAH / KURANG) */}
          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
              Tahun Hijriyah
            </label>
            <div className="relative flex items-center h-[42px] bg-gray-950/60 border border-gray-800 rounded-2xl px-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => handleYearChange(tahunHijri - 1)}
                className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10"
                title="Kurangi Tahun"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="number"
                value={tahunHijri}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                placeholder="1448"
                className="w-full h-full px-2 bg-transparent text-white font-mono text-xs text-center font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />

              <button
                type="button"
                onClick={() => handleYearChange(tahunHijri + 1)}
                className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10"
                title="Tambah Tahun"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* TANGGAL MULAI & SELESAI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
              Tanggal Mulai
            </label>
            <CustomDatePickerHijriyah
              value={tglMulai}
              onChange={(val) => {
                setTglMulai(val);
                if (localError) setLocalError(null);
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
              Tanggal Selesai
            </label>
            <CustomDatePickerHijriyah
              value={tglSelesai}
              onChange={(val) => {
                setTglSelesai(val);
                if (localError) setLocalError(null);
              }}
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 rounded-2xl border border-gray-800 bg-gray-900/80 text-gray-300 hover:bg-gray-800 hover:text-white text-xs font-mono font-semibold transition-all active:scale-95"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={
              isPending ||
              !namaPeriode.trim() ||
              !tglMulai ||
              !tglSelesai ||
              isDateInvalid
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-semibold rounded-2xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all border border-indigo-400/30"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Periode</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};