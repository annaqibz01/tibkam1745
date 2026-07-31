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
}

export function useRapidScanPos(isOpen: boolean, periodeId?: string) {
  const queryClient = useQueryClient();

  const [enableSound, setEnableSound] = useState(true);
  const [printMode, setPrintMode] = useState<PrintMode>("auto"); // Default Mode: AUTO
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [wisTimeStr, setWisTimeStr] = useState("");

  const [lastResult, setLastResult] = useState<LastResultState>({
    status: "idle",
    message: "",
  });

  const [sessionLogs, setSessionLogs] = useState<ScanSessionLog[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateWisClock = () => {
      const detailWis = dapatkanDetailWis();
      setWisTimeStr(detailWis.stringLengkap);
    };

    updateWisClock();
    const interval = setInterval(updateWisClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🎯 Focus & Select otomatis agar scan berikutnya langsung menimpa isi teks
  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (isOpen && !isProcessing) {
      focusInput();
    }
  }, [isOpen, isProcessing, focusInput]);

  const handleProcessScan = async (codeToProcess: string) => {
    const queryCode = codeToProcess.trim();
    if (!queryCode || isProcessing) return;

    setIsProcessing(true);
    setBarcodeInput("");

    try {
      const currentUser = pb.authStore.record || pb.authStore.model;
      // 🛡️ Buka proteksi POS jika role adalah admin ATAU admin_rambut
      const isAdmin =
        currentUser?.role === "admin" || currentUser?.role === "admin_rambut";

      if (!periodeId) {
        throw new Error(
          "Gagal! Tidak ada periode setor yang sedang aktif/ditinjau.",
        );
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
            `POS Ditutup! Periode "${periode.nama_periode}" tidak dalam status AKTIF.`,
          );
        }

        if (
          !isDateWithinRange(
            new Date(),
            periode.tanggal_mulai,
            periode.tanggal_selesai,
          )
        ) {
          throw new Error(
            `POS Ditutup! Hari ini berada di luar jadwal operasional periode "${periode.nama_periode}".`,
          );
        }
      }

      // 🎯 PENGAMAN 2: KUERI KHUSUS EXACT MATCH ID PPS (TIDAK BISA PAKE NAMA)
      const filterQuery = `periode = "${periodeId}" && id_pps = "${queryCode}"`;

      const matchRecord = await pb
        .collection("wajib_setor_rambut")
        .getFirstListItem<WajibSetorExpanded>(filterQuery, {
          expand: "santri,periode",
        });

      if (!matchRecord) {
        throw new Error(
          `ID PPS "${queryCode}" tidak terdaftar di antrean periode ini.`,
        );
      }

      const santriData = matchRecord.expand?.santri;
      const santriNama = santriData?.nama || "Santri";
      const idPps = matchRecord.id_pps;

      if (matchRecord.status_setor === "sudah") {
        throw new Error(
          `SANTRI ${santriNama.toUpperCase()} (${idPps}) SUDAH SETOR SEBELUMNYA!`,
        );
      }

      if (matchRecord.status_setor === "dispensasi") {
        throw new Error(
          `SANTRI ${santriNama.toUpperCase()} (${idPps}) MEMILIKI STATUS DISPENSASI!`,
        );
      }

      const nowIso = new Date().toISOString();
      const detailWis = dapatkanDetailWis();
      const currentUserId = currentUser?.id || "";
      const penerimaNama = (
        currentUser?.username || "PETUGAS TIBKAM"
      ).toUpperCase();

      // Update status wajib_setor_rambut
      await pb.collection("wajib_setor_rambut").update(matchRecord.id, {
        status_setor: "sudah",
        tanggal_setor: nowIso,
      });

      // Catat ke riwayat_setor_rambut
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
      const kelasTingkatanStr = [kelasVal, tingkatanVal]
        .filter(Boolean)
        .join(" ");
      const domisiliStr =
        santriData?.domisili || santriData?.status_domisili || "-";
      const alamatStr = getAlamatStr(santriData);

      const hijriData = await fetchHijriByDate(nowIso);
      const stringHijri = hijriData?.string_hijri || "-";

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
        ...receiptDetails,
      });

      if (enableSound) playAudioFeedback("success");

      // ⚡ PROSES CETAK ASINKRONUS (Non-blocking)
      const htmlReceipt = buildReceiptHtml(receiptDetails);
      executePrint(htmlReceipt, { mode: printMode }).catch((err) => {
        console.error("❌ Background Print Error:", err);
      });

      // Update log UI POS
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

      queryClient.invalidateQueries({
        queryKey: ["rambut-wajib-setor-list-full"],
      });
      queryClient.invalidateQueries({ queryKey: ["rambut-riwayat-list"] });
      queryClient.invalidateQueries({ queryKey: ["rambut-stats-real"] });
    } catch (err: any) {
      const errMsg =
        parsePocketBaseError(err) || err.message || "Gagal memproses setoran.";

      setLastResult({
        status: "error",
        message: errMsg,
      });

      if (enableSound) playAudioFeedback("error");
    } finally {
      setIsProcessing(false);
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
