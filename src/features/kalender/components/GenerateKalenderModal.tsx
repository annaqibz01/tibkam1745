// src/features/kalender/components/GenerateKalenderModal.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { CustomDatePickerMasehi } from "@/components/shared/CustomDatePickerMasehi";
import { useAdminKalender, GenerateBulanPayload } from "../hooks/useKalenderHijriyah";
import { useToast } from "@/context/ToastContext";
import { KalenderHijriyahBulanHijriNamaOptions } from "@/types/pocketbase-types";
import {
  CalendarDays,
  Settings2,
  Loader2,
  ChevronDown,
  Check,
  Minus,
  Plus,
  Calendar,
  AlertCircle,
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
  const { showSuccess } = useToast();
  const { useGenerateBulan, useLatestKalender } = useAdminKalender();

  const { data: latestRecord } = useLatestKalender();

  const [bulanSelect, setBulanSelect] = useState(BULAN_OPTIONS[0]);
  const [tahun, setTahun] = useState<number>(1448);
  const [tglAwal, setTglAwal] = useState("");
  const [tglAkhir, setTglAkhir] = useState("");
  const [formError, setFormError] = useState<string>("");

  const [isBulanDropdownOpen, setIsBulanDropdownOpen] = useState(false);
  const bulanDropdownRef = useRef<HTMLDivElement>(null);

  const generateMutation = useGenerateBulan();

  // Auto-Suggest Bulan, Tahun, & Tanggal Awal saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setFormError("");
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

  // Perhitungan Selisih Hari
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
    setFormError("");

    if (!tglAwal || !tglAkhir || !tahun) {
      setFormError("Mohon lengkapi seluruh isian titik jepit tanggal.");
      return;
    }

    if (!isValidDays) {
      setFormError(`Jumlah hari terhitung ${calculatedDays} hari. Bulan Hijriyah wajib 29 atau 30 hari.`);
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
        onClose();
      },
      onError: (err: any) => {
        setFormError(err.message || "Gagal menggenerate kalender.");
      },
    });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Kalender Hijriyah"
      icon={<CalendarDays className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleGenerate} className="space-y-3.5 font-sans" noValidate>
        {/* Banner Info Referensi Data Terakhir */}
        {latestRecord && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs">
            <Info className="w-4 h-4 shrink-0 text-indigo-400" />
            <span className="leading-tight">
              Terakhir tercatat:{" "}
              <strong className="text-zinc-100 font-mono">{latestRecord.string_hijri}</strong>.
            </span>
          </div>
        )}

        {/* Error Inline Banner (Standar UI_RULES: bukan popup toast melayang) */}
        {formError && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{formError}</span>
          </div>
        )}

        {/* Form Grid: Bulan & Tahun (Tinggi h-9) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dropdown Bulan */}
          <div ref={bulanDropdownRef} className="relative">
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Bulan Hijriyah
            </label>
            <button
              type="button"
              onClick={() => setIsBulanDropdownOpen(!isBulanDropdownOpen)}
              className={`w-full h-9 flex items-center justify-between px-3 bg-zinc-950 border rounded-lg text-xs transition-colors shadow-sm ${
                isBulanDropdownOpen
                  ? "border-zinc-700 bg-zinc-800/80 text-white"
                  : "border-zinc-800 text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <span className="truncate font-sans font-medium">
                {bulanSelect.angka}. {bulanSelect.nama}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-500 shrink-0 transition-transform duration-150 ${
                  isBulanDropdownOpen ? "rotate-180 text-zinc-200" : ""
                }`}
              />
            </button>

            {isBulanDropdownOpen && (
              <div className="absolute left-0 z-30 mt-1 w-full max-h-48 overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-1 space-y-0.5 custom-scrollbar">
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
                      className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                        isSelected
                          ? "bg-zinc-800 text-white font-semibold"
                          : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
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

          {/* Input Tahun */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Tahun Hijriyah
            </label>
            <div className="relative flex items-center h-9 bg-zinc-950 border border-zinc-800 rounded-lg px-1">
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setTahun((prev) => Math.max(1300, prev - 1))}
                className="w-7 h-7 flex items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>

              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                placeholder="1448"
                className="w-full h-full bg-transparent text-white font-mono text-xs text-center font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                type="button"
                tabIndex={-1}
                onClick={() => setTahun((prev) => prev + 1)}
                className="w-7 h-7 flex items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Box Titik Jepit Masehi */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3.5 space-y-3">
          <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
              Penentuan Titik Jepit Masehi
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Tgl Awal (1 Hijriyah)
              </label>
              <CustomDatePickerMasehi
                value={tglAwal}
                onChange={setTglAwal}
                placeholder="Pilih Tanggal Awal"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Tgl Akhir (29/30 Hijriyah)
              </label>
              <CustomDatePickerMasehi
                value={tglAkhir}
                onChange={setTglAkhir}
                placeholder="Pilih Tanggal Akhir"
              />
            </div>
          </div>

          {/* Indikator Durasi Hari */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">Total Durasi:</span>
            {!tglAwal || !tglAkhir ? (
              <span className="text-[11px] text-zinc-500">Menunggu tanggal lengkap</span>
            ) : isValidDays ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> {calculatedDays} Hari (Valid Syariat)
              </span>
            ) : calculatedDays < 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                <AlertCircle className="w-3 h-3" /> Tanggal Tidak Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <AlertCircle className="w-3 h-3" /> {calculatedDays} Hari (Wajib 29/30 Hari)
              </span>
            )}
          </div>
        </div>

        {/* Ringkasan Konfirmasi */}
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Target Hasil:</span>
          <span className="text-zinc-100 font-bold font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
            {bulanSelect.nama} {tahun} H
          </span>
        </div>

        {/* Modal Actions Footer (Tinggi h-9) */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={generateMutation.isPending || !isValidDays}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors active:scale-98"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memetakan...</span>
              </>
            ) : (
              <>
                <Settings2 className="w-3.5 h-3.5" />
                <span>Eksekusi Mapping</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};