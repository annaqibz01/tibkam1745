// src/components/kalender/GenerateKalenderModal.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { BaseModal } from "../shared/BaseModal";
// ✨ Import dari CustomDatePicker (nama file asli di folder shared)
import { CustomDatePickerMasehi } from "../shared/CustomDatePickerMasehi";
import { useAdminKalender, GenerateBulanPayload } from "../../hooks/useKalenderHijriyah";
import { useToast } from "../../context/ToastContext";
import { KalenderHijriyahBulanHijriNamaOptions } from "../../types/pocketbase-types";
import {
  CalendarDays,
  Settings2,
  Loader2,
  ChevronDown,
  Check,
  Minus,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface GenerateKalenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BULAN_OPTIONS: { angka: number; nama: KalenderHijriyahBulanHijriNamaOptions }[] = [
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
];

export const GenerateKalenderModal: React.FC<GenerateKalenderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showSuccess, showError } = useToast();
  const { useGenerateBulan, useLatestKalender } = useAdminKalender();

  const { data: latestRecord } = useLatestKalender();

  const [bulanSelect, setBulanSelect] = useState(BULAN_OPTIONS[0]);
  const [tahun, setTahun] = useState<number>(1448);
  const [tglAwal, setTglAwal] = useState("");
  const [tglAkhir, setTglAkhir] = useState("");

  const [isBulanDropdownOpen, setIsBulanDropdownOpen] = useState(false);
  const bulanDropdownRef = useRef<HTMLDivElement>(null);

  const generateMutation = useGenerateBulan();

  // Auto-Suggest Bulan, Tahun, & Tanggal Awal saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (latestRecord) {
        const lastMonthAngka = latestRecord.bulan_hijri_angka || 1;
        const lastTahun = latestRecord.tahun_hijri || 1448;

        const nextMonthAngka = lastMonthAngka === 12 ? 1 : lastMonthAngka + 1;
        const nextTahun = lastMonthAngka === 12 ? lastTahun + 1 : lastTahun;
        const nextBulanObj =
          BULAN_OPTIONS.find((b) => b.angka === nextMonthAngka) || BULAN_OPTIONS[0];

        setBulanSelect(nextBulanObj);
        setTahun(nextTahun);

        if (latestRecord.tanggal_masehi) {
          const lastDate = new Date(latestRecord.tanggal_masehi);
          lastDate.setDate(lastDate.getDate() + 1);

          const yyyy = lastDate.getFullYear();
          const mm = String(lastDate.getMonth() + 1).padStart(2, "0");
          const dd = String(lastDate.getDate()).padStart(2, "0");
          setTglAwal(`${yyyy}-${mm}-${dd}`);
        } else {
          setTglAwal("");
        }
      } else {
        setBulanSelect(BULAN_OPTIONS[0]);
        setTahun(1448);
        setTglAwal("");
      }
      setTglAkhir("");
      setIsBulanDropdownOpen(false);
    }
  }, [isOpen, latestRecord]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bulanDropdownRef.current &&
        !bulanDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBulanDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Calculation Selisih Hari
  const calculatedDays = useMemo(() => {
    if (!tglAwal || !tglAkhir) return 0;
    const start = new Date(tglAwal);
    const end = new Date(tglAkhir);
    start.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return -1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [tglAwal, tglAkhir]);

  const isValidDays = calculatedDays === 29 || calculatedDays === 30;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tglAwal || !tglAkhir || !tahun) {
      showError("Mohon lengkapi semua isian titik jepit tanggal.");
      return;
    }

    if (!isValidDays) {
      showError("Jumlah hari harus 29 atau 30 hari!");
      return;
    }

    const payload: GenerateBulanPayload = {
      bulan_angka: bulanSelect.angka,
      bulan_nama: bulanSelect.nama,
      tahun: tahun,
      tanggal_awal_masehi: tglAwal,
      tanggal_akhir_masehi: tglAkhir,
    };

    generateMutation.mutate(payload, {
      onSuccess: (totalHari) => {
        showSuccess(
          `Berhasil memetakan ${totalHari} hari untuk bulan ${payload.bulan_nama} ${payload.tahun} H!`,
          "Mapping Sukses"
        );
      },
      onError: (err: any) => {
        showError(err.message || "Gagal menggenerate kalender.");
      },
      onSettled: () => {
        onClose();
      },
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Kalender Hijriyah"
      icon={<CalendarDays className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleGenerate} className="space-y-4 pt-1">
        
        {/* BANNER SARAN OTOMATIS */}
        {latestRecord && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <Info className="w-4 h-4 flex-shrink-0 text-indigo-400" />
            <span>
              Terakhir tercatat:{" "}
              <strong className="text-white font-mono">{latestRecord.string_hijri}</strong>. Form otomatis disesuaikan.
            </span>
          </div>
        )}

        {/* BULAN & TAHUN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div ref={bulanDropdownRef} className="relative">
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
              Bulan Hijriyah Target
            </label>
            <button
              type="button"
              onClick={() => setIsBulanDropdownOpen(!isBulanDropdownOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-950/60 backdrop-blur-xl border rounded-2xl text-white text-xs font-mono transition-all duration-200 shadow-inner ${
                isBulanDropdownOpen
                  ? "border-indigo-500/60 ring-2 ring-indigo-500/20 text-indigo-200"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <span className="truncate font-bold">
                {bulanSelect.angka}. {bulanSelect.nama}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  isBulanDropdownOpen ? "rotate-180 text-indigo-400" : ""
                }`}
              />
            </button>

            {isBulanDropdownOpen && (
              <div className="absolute left-0 z-30 mt-2 w-full max-h-48 overflow-y-auto bg-gray-900/98 backdrop-blur-2xl border border-gray-800/90 rounded-2xl shadow-2xl p-1.5 space-y-0.5 custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
                {BULAN_OPTIONS.map((b) => {
                  const isSelected = bulanSelect.angka === b.angka;
                  return (
                    <button
                      key={b.angka}
                      type="button"
                      onClick={() => {
                        setBulanSelect(b);
                        setIsBulanDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition-colors duration-150 ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                          : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                      }`}
                    >
                      <span>
                        {b.angka}. {b.nama}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
              Tahun Hijriyah
            </label>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => setTahun((prev) => Math.max(1300, prev - 1))}
                className="absolute left-1.5 p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                placeholder="1448"
                className="w-full px-10 py-2.5 bg-gray-950/60 border border-gray-800 rounded-2xl text-white font-mono text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-inner transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                type="button"
                onClick={() => setTahun((prev) => prev + 1)}
                className="absolute right-1.5 p-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 active:scale-90 transition-all shadow-sm z-10"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* BOX TITIK JEPIT MASEHI */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-amber-950/20 to-gray-950/80 p-4 shadow-xl backdrop-blur-md space-y-3.5">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                Penentuan Titik Jepit Masehi
              </h4>
            </div>
          </div>

          <div className="space-y-1.5">
            {/* BARIS 1: GRID TEKS LABEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
              <label className="block text-[11px] font-mono text-amber-200/90 leading-tight">
                Tgl Awal (1 Hijriyah)
              </label>
              <label className="block text-[11px] font-mono text-amber-200/90 leading-tight">
                Tgl Akhir (29/30 Hijriyah)
              </label>
            </div>

            {/* BARIS 2: GRID INPUT DATEPICKER MASEHI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <CustomDatePickerMasehi
                value={tglAwal}
                onChange={setTglAwal}
                placeholder="Pilih Tanggal Awal Masehi"
              />
              <CustomDatePickerMasehi
                value={tglAkhir}
                onChange={setTglAkhir}
                placeholder="Pilih Tanggal Akhir Masehi"
              />
            </div>
          </div>

          {/* SLOT INDIKATOR DURASI */}
          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono min-h-[30px]">
            <span className="text-gray-400">Total Durasi:</span>
            {!tglAwal || !tglAkhir ? (
              <span className="inline-flex items-center gap-1 text-gray-500 font-medium bg-gray-900/60 px-2.5 py-0.5 rounded-lg border border-gray-800/80">
                Belum Lengkap
              </span>
            ) : isValidDays ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> {calculatedDays} Hari (Valid Syariat)
              </span>
            ) : calculatedDays < 0 ? (
              <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20">
                <AlertTriangle className="w-3.5 h-3.5" /> Tanggal Tidak Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" /> {calculatedDays} Hari (Wajib 29/30 Hari)
              </span>
            )}
          </div>
        </div>

        {/* RINGKASAN VERIFIKASI */}
        <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-xs font-mono">
          <span className="text-gray-400">Target Mapping:</span>
          <span className="text-indigo-200 font-bold text-sm bg-indigo-500/20 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
            {bulanSelect.nama} {tahun} H
          </span>
        </div>

        {/* MODAL ACTIONS FOOTER */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2.5 rounded-2xl border border-gray-800 bg-gray-900/80 text-gray-300 hover:bg-gray-800 hover:text-white text-xs font-mono font-semibold transition-all active:scale-95"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={generateMutation.isPending || !isValidDays}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-semibold rounded-2xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all border border-indigo-400/30"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Mapping...</span>
              </>
            ) : (
              <>
                <Settings2 className="w-4 h-4" />
                <span>Eksekusi Mapping</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};