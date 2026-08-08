// src/features/rambut/hooks/useRapidScanPos.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { parsePocketBaseError } from "@/utils/errorHandler";
import { dapatkanDetailWis } from "@/utils/waktuIstiwa";
import { fetchHijriByDate } from "@/features/kalender";
import { playAudioFeedback } from "../utils/posAudio";
import { buildReceiptHtml, getAlamatStr } from "../utils/posPrinter";
import { executePrint } from "@/utils/printer";
import { isDateWithinRange } from "@/utils/dateHelpers";
import type { PrintMode } from "@/types/printer";
import type { WajibSetorExpanded } from "./useRambut";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";

export interface ScanSessionLog {
  id: string;
  idPps: string;
  namaSantri: string;
  tingkatan: string;
  kelas: string;
  timestampWis: string;
  status: "success" | "error";
  message: string;
}

export interface LastResultState {
  status: "idle" | "success" | "error";
  message: string;
  santriName?: string;
  idPps?: string;
  kelasTingkatan?: string;
  domisili?: string;
  alamat?: string;
  tanggalHijri?: string;
  waktu?: string;
  penerima?: string;
  fotoUrl?: string;
  foto?: string;
  record?: any;
}

export function useRapidScanPos(isOpen: boolean, periodeId?: string) {
  const queryClient = useQueryClient();

  const [enableSound, setEnableSound] = useState(true);
  const [printMode, setPrintMode] = useState<PrintMode>("auto");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [wisTimeStr, setWisTimeStr] = useState("");

  const [lastResult, setLastResult] = useState<LastResultState>({
    status: "idle",
    message: "",
  });

  const [sessionLogs, setSessionLogs] = useState<ScanSessionLog[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update Clock Waktu Istiwa'
  useEffect(() => {
    const updateWisClock = () => {
      const detailWis = dapatkanDetailWis();
      setWisTimeStr(detailWis.stringLengkap);
    };

    updateWisClock();
    const interval = setInterval(updateWisClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Smart Focus Management (Bebas dari focus-trap)
  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current && !isProcessing) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 60);
  }, [isProcessing]);

  // Focus otomatis saat modal dibuka & setelah proses selesai
  useEffect(() => {
    if (isOpen && !isProcessing) {
      focusInput();
    }
  }, [isOpen, isProcessing, focusInput]);

  // Shortcut Keyboard: F1 (Toggle Sound) & F2 (Cycle Print Mode)
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        setEnableSound((prev) => !prev);
      } else if (e.key === "F2") {
        e.preventDefault();
        setPrintMode((prev) => {
          if (prev === "off") return "auto";
          if (prev === "auto") return "silent";
          return "off";
        });
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [isOpen]);

  const handleProcessScan = async (codeToProcess: string) => {
    const queryCode = codeToProcess.trim();
    if (!queryCode || isProcessing) return;

    setIsProcessing(true);

    try {
      const currentUser = pb.authStore.record || pb.authStore.model;
      const isAdmin =
        currentUser?.role === "admin" || currentUser?.role === "admin_rambut";

      if (!periodeId) {
        throw new Error("Gagal! Tidak ada periode setor yang sedang aktif/ditinjau.");
      }

      const periode = await pb
        .collection("periode_rambut")
        .getOne<PeriodeRambutResponse>(periodeId);

      if (!periode) {
        throw new Error("Data periode tidak ditemukan di sistem.");
      }

      if (!isAdmin) {
        if (periode.status_periode !== "aktif") {
          throw new Error(
            `POS Ditutup! Periode "${periode.nama_periode}" tidak dalam status AKTIF.`
          );
        }

        if (
          !isDateWithinRange(
            new Date(),
            periode.tanggal_mulai,
            periode.tanggal_selesai
          )
        ) {
          throw new Error(
            `POS Ditutup! Hari ini berada di luar jadwal operasional periode "${periode.nama_periode}".`
          );
        }
      }

      const filterQuery = `periode = "${periodeId}" && id_pps = "${queryCode}"`;

      const matchRecord = await pb
        .collection("wajib_setor_rambut")
        .getFirstListItem<WajibSetorExpanded>(filterQuery, {
          expand: "santri,periode",
        });

      if (!matchRecord) {
        throw new Error(`ID PPS "${queryCode}" tidak terdaftar di antrean periode ini.`);
      }

      const santriData = matchRecord.expand?.santri;
      const santriNama = santriData?.nama || "Santri";
      const idPps = matchRecord.id_pps;

      if (matchRecord.status_setor === "sudah") {
        throw new Error(
          `SANTRI ${santriNama.toUpperCase()} (${idPps}) SUDAH SETOR SEBELUMNYA!`
        );
      }

      if (matchRecord.status_setor === "dispensasi") {
        throw new Error(
          `SANTRI ${santriNama.toUpperCase()} (${idPps}) MEMILIKI STATUS DISPENSASI!`
        );
      }

      const nowIso = new Date().toISOString();
      const detailWis = dapatkanDetailWis();
      const currentUserId = currentUser?.id || "";
      const penerimaNama = (
        currentUser?.username || "PETUGAS TIBKAM"
      ).toUpperCase();

      await pb.collection("wajib_setor_rambut").update(matchRecord.id, {
        status_setor: "sudah",
        tanggal_setor: nowIso,
      });

      const riwayatRecord = await pb.collection("riwayat_setor_rambut").create({
        wajib_setor: matchRecord.id,
        santri: matchRecord.santri || matchRecord.expand?.santri?.id || "",
        id_pps: matchRecord.id_pps,
        periode: matchRecord.periode,
        tanggal_setor: nowIso,
        waktu_wis: detailWis.stringLengkap,
        petugas_eksekutor: currentUserId,
        catatan: `Setor POS Barcode pada ${detailWis.stringLengkap}`,
      });

      const kelasVal = santriData?.kelas ? `${santriData.kelas}` : "";
      const tingkatanVal = santriData?.tingkatan || "";
      const kelasTingkatanStr = [kelasVal, tingkatanVal].filter(Boolean).join(" ");
      const domisiliStr = santriData?.domisili || santriData?.status_domisili || "-";
      const alamatStr = getAlamatStr(santriData);

      const hijriData = await fetchHijriByDate(nowIso);
      const stringHijri = hijriData?.string_hijri || "-";

      // Ambil URL Foto Santri jika berkas foto tersedia
      const fotoUrl = santriData?.foto
        ? pb.getFileUrl(santriData, santriData.foto)
        : undefined;

      const receiptDetails = {
        idPps: matchRecord.id_pps,
        nama: santriNama,
        kelasTingkatan: kelasTingkatanStr,
        domisili: domisiliStr,
        alamat: alamatStr,
        tanggalHijri: stringHijri,
        waktu: detailWis.stringLengkap,
        penerima: penerimaNama,
      };

      setLastResult({
        status: "success",
        message: "SETORAN PERAPIAN RAMBUT TERVERIFIKASI LUNAS!",
        santriName: santriNama,
        fotoUrl,
        foto: santriData?.foto,
        record: santriData,
        ...receiptDetails,
      });

      if (enableSound) playAudioFeedback("success");

      const htmlReceipt = buildReceiptHtml(receiptDetails);
      executePrint(htmlReceipt, { mode: printMode }).catch((err) => {
        console.error("❌ Background Print Error:", err);
      });

      setSessionLogs((prev) => [
        {
          id: riwayatRecord.id,
          idPps: matchRecord.id_pps,
          namaSantri: santriNama,
          tingkatan: tingkatanVal,
          kelas: kelasVal,
          timestampWis: detailWis.stringLengkap,
          status: "success",
          message: "Lunas / Terverifikasi",
        },
        ...prev.slice(0, 9),
      ]);

      queryClient.invalidateQueries({ queryKey: ["rambut-wajib-setor-list-full"] });
      queryClient.invalidateQueries({ queryKey: ["rambut-riwayat-list"] });
      queryClient.invalidateQueries({ queryKey: ["rambut-stats-real"] });
    } catch (err: any) {
      const errMsg = parsePocketBaseError(err) || err.message || "Gagal memproses setoran.";

      setLastResult({
        status: "error",
        message: errMsg,
      });

      if (enableSound) playAudioFeedback("error");
    } finally {
      setIsProcessing(false);
      setBarcodeInput(""); // Bersihkan input otomatis untuk scan selanjutnya
      focusInput();
    }
  };

  return {
    enableSound,
    setEnableSound,
    printMode,
    setPrintMode,
    barcodeInput,
    setBarcodeInput,
    isProcessing,
    wisTimeStr,
    lastResult,
    sessionLogs,
    inputRef,
    focusInput,
    handleProcessScan,
  };
}