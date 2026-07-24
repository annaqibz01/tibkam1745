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
import type { PrintMode } from "@/types/printer";
import type { WajibSetorExpanded } from "./useRambut";

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

  // 🎯 PERBAIKAN: Beri delay singkat agar React selesai merender status `disabled={false}` 
  // lalu fokuskan kursor dan seleksi seluruh isi teks.
  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select(); // 👈 Menyeleksi seluruh isi input agar scan berikutnya langsung menimpa
      }
    }, 50);
  }, []);

  // 🎯 PERBAIKAN: Memicu fokus & seleksi otomatis setiap kali modal dibuka ATAU setelah proses scan selesai (isProcessing = false)
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
      let filterQuery = `(id_pps = "${queryCode}" || santri.nama ~ "${queryCode}")`;
      if (periodeId) {
        filterQuery = `periode = "${periodeId}" && ` + filterQuery;
      }

      const matchRecord = await pb
        .collection("wajib_setor_rambut")
        .getFirstListItem<WajibSetorExpanded>(filterQuery, {
          expand: "santri,periode",
        });

      if (!matchRecord) {
        throw new Error(
          `Data PPS / Nama "${queryCode}" tidak ditemukan di antrean periode ini.`,
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
      const currentUser = pb.authStore.record || pb.authStore.model;
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

      // ⚡ PROSES CETAK ASINKRONUS (Tanpa await agar UI POS instant/cepat)
      const htmlReceipt = buildReceiptHtml(receiptDetails);
      executePrint(htmlReceipt, { mode: printMode }).catch((err) => {
        console.error("❌ Background Print Error:", err);
      });

      // Langsung update log UI tanpa menunggu fisik printer selesai
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
      const errMsg =
        parsePocketBaseError(err) || err.message || "Gagal memproses setoran.";

      setLastResult({
        status: "error",
        message: errMsg,
      });

      if (enableSound) playAudioFeedback("error");
    } finally {
      setIsProcessing(false);
      focusInput(); // Memicu seleksi teks & fokus ulang setelah proses selesai
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