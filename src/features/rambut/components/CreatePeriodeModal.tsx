// src/features/rambut/components/CreatePeriodeModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { CustomDatePickerHijriyah } from "@/components/shared/CustomDatePickerHijriyah";
import NotificationToast, { ToastMessage } from "@/components/shared/NotificationToast";
import { useTodayHijri } from "@/features/kalender";
import { toLocalYMD } from "@/utils/dateHelpers";
import type { CreatePeriodePayload } from "../hooks/useRambut";
import {
  Calendar,
  Loader2,
  Save,
  Minus,
  Plus,
} from "lucide-react";

interface CreatePeriodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePeriodePayload) => void;
  isPending: boolean;
  existingPeriodes?: Array<{ nama_periode: string; tanggal_mulai: string; tanggal_selesai: string }>;
}

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
  existingPeriodes = [],
}) => {
  const { data: todayHijri } = useTodayHijri();

  const [namaPeriode, setNamaPeriode] = useState("");
  const [bulanHijri, setBulanHijri] = useState<number>(1);
  const [tahunHijri, setTahunHijri] = useState<number>(1448);
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const activeBulan = useMemo(() => {
    return (
      BULAN_HIJRI_OPTIONS.find((b) => b.angka === bulanHijri) ||
      BULAN_HIJRI_OPTIONS[0]
    );
  }, [bulanHijri]);

  // 🎯 FIX 1: Reset Form & Toast baik saat BUKA maupun saat TUTUP modal
  useEffect(() => {
    if (isOpen) {
      setNamaPeriode("");
      setTglMulai("");
      setTglSelesai("");
      setToast(null);

      if (todayHijri) {
        if (todayHijri.bulan_hijri_angka) setBulanHijri(todayHijri.bulan_hijri_angka);
        if (todayHijri.tahun_hijri) setTahunHijri(todayHijri.tahun_hijri);
      }
    } else {
      // Bersihkan state total ketika modal tertutup agar tidak membocorkan toast ke halaman utama
      setNamaPeriode("");
      setTglMulai("");
      setTglSelesai("");
      setToast(null);
    }
  }, [isOpen, todayHijri]);

  // ==================== AREA VALIDASI STRICT ====================

  const isDateInvalid = useMemo(() => {
    if (!tglMulai || !tglSelesai) return false;
    const startStr = toLocalYMD(tglMulai);
    const endStr = toLocalYMD(tglSelesai);
    return endStr < startStr;
  }, [tglMulai, tglSelesai]);

  const isNameDuplicate = useMemo(() => {
    if (!namaPeriode.trim() || !Array.isArray(existingPeriodes)) return false;
    const target = namaPeriode.trim().toLowerCase();
    return existingPeriodes.some(
      (p) => (p?.nama_periode || "").trim().toLowerCase() === target
    );
  }, [namaPeriode, existingPeriodes]);

  const isDateOverlapping = useMemo(() => {
    if (!tglMulai || !tglSelesai || !Array.isArray(existingPeriodes)) return false;

    const startNew = toLocalYMD(tglMulai);
    const endNew = toLocalYMD(tglSelesai);

    return existingPeriodes.some((p) => {
      if (!p?.tanggal_mulai || !p?.tanggal_selesai) return false;
      const startExisting = toLocalYMD(p.tanggal_mulai);
      const endExisting = toLocalYMD(p.tanggal_selesai);

      return startNew <= endExisting && endNew >= startExisting;
    });
  }, [tglMulai, tglSelesai, existingPeriodes]);

  // 🎯 FIX 2: Pemicu Toast HANYA berjalan jika modal sedang TERBUKA (`isOpen === true`)
  useEffect(() => {
    if (!isOpen) {
      setToast(null);
      return;
    }

    if (isDateInvalid) {
      setToast({
        title: "Tanggal Tidak Valid",
        message: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai!",
        type: "error",
      });
    } else if (isNameDuplicate) {
      setToast({
        title: "Nama Periode Sama",
        message: "Nama periode sudah terdaftar di sistem. Gunakan nama lain!",
        type: "warning",
      });
    } else if (isDateOverlapping) {
      setToast({
        title: "Jadwal Bentrok",
        message: "Rentang tanggal bertabrakan dengan periode yang sudah ada!",
        type: "error",
      });
    } else {
      setToast(null);
    }
  }, [isOpen, isDateInvalid, isNameDuplicate, isDateOverlapping]);

  const handlePrevBulan = () => {
    let nextBulan = bulanHijri - 1;
    let nextTahun = tahunHijri;
    if (nextBulan < 1) {
      nextBulan = 12;
      nextTahun -= 1;
    }
    setBulanHijri(nextBulan);
    setTahunHijri(nextTahun);
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
  };

  const handleYearChange = (newYear: number) => {
    const safeYear = Math.max(1300, newYear);
    setTahunHijri(safeYear);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaPeriode.trim() || !tglMulai || !tglSelesai) {
      setToast({ title: "Form Belum Lengkap", message: "Harap isi semua data.", type: "warning" });
      return;
    }
    if (isDateInvalid || isNameDuplicate || isDateOverlapping) {
      setToast({ title: "Gagal Menyimpan", message: "Harap periksa kembali eror pada form.", type: "error" });
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
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Buat Periode Setoran Baru"
        icon={<Calendar className="w-5 h-5 text-indigo-400" />}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-1 px-1 sm:px-4 select-none font-mono">

          {/* NAMA PERIODE */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Nama Periode {isNameDuplicate && <span className="text-rose-400 font-bold ml-1">(Sudah Ada)</span>}
            </label>
            <input
              type="text"
              value={namaPeriode}
              onChange={(e) => setNamaPeriode(e.target.value)}
              placeholder="Contoh: Setoran Rambut Muharram 1448 H"
              className={`w-full h-[42px] px-4 bg-gray-950/60 border rounded-2xl text-white text-xs focus:outline-none focus:ring-2 shadow-inner transition-all ${
                isNameDuplicate ? "border-rose-500 focus:ring-rose-500/40" : "border-gray-800 focus:ring-indigo-500/40"
              }`}
              required
            />
          </div>

          {/* BULAN & TAHUN HIJRIYAH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Bulan Hijriyah Target
              </label>
              <div className="relative flex items-center h-[42px] bg-gray-950/60 border border-gray-800 rounded-2xl px-1.5 shadow-inner">
                <button type="button" onClick={handlePrevBulan} className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 text-center text-xs font-bold text-amber-300 truncate px-2 select-none">
                  {activeBulan.angka}. {activeBulan.nama}
                </div>
                <button type="button" onClick={handleNextBulan} className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Tahun Hijriyah
              </label>
              <div className="relative flex items-center h-[42px] bg-gray-950/60 border border-gray-800 rounded-2xl px-1.5 shadow-inner">
                <button type="button" onClick={() => handleYearChange(tahunHijri - 1)} className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={tahunHijri}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  placeholder="1448"
                  className="w-full h-full px-2 bg-transparent text-white text-xs text-center font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
                <button type="button" onClick={() => handleYearChange(tahunHijri + 1)} className="p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* TANGGAL MULAI & SELESAI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Tanggal Mulai
              </label>
              <CustomDatePickerHijriyah value={tglMulai} onChange={(val) => setTglMulai(val)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Tanggal Selesai {(isDateOverlapping || isDateInvalid) && <span className="text-rose-400 font-bold ml-1">(! Error)</span>}
              </label>
              <CustomDatePickerHijriyah value={tglSelesai} onChange={(val) => setTglSelesai(val)} />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-2xl border border-gray-800 bg-gray-900/80 text-gray-300 hover:bg-gray-800 hover:text-white text-xs font-semibold transition-all active:scale-95"
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
                isDateInvalid ||
                isNameDuplicate ||
                isDateOverlapping
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-2xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all border border-indigo-400/30"
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

      {/* 🎯 FIX 3: Hanya render Toast jika modal sedang aktif/terbuka */}
      {isOpen && (
        <NotificationToast toast={toast} onClose={() => setToast(null)} duration={4000} />
      )}
    </>
  );
};