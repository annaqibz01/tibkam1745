// src/features/master/utils/syncFotoToPocketBase.ts
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { pb } from "@/lib/pocketbase";
import type { MasterResponse } from "@/types/pocketbase-types";

export interface PhotoScanItem {
  id_pps: string;
  source_path: string;
  subfolder: string;
}

export interface SyncFotoProgress {
  step: "scanning" | "matching" | "compressing" | "uploading";
  current: number;
  total: number;
  message: string;
  percent: number;
}

export interface SyncFotoReport {
  totalScanned: number;
  matchedCount: number;
  skippedUpToDate: number;
  successUpload: number;
  failedUpload: number;
  isCancelled?: boolean;
}

export type LogType = "info" | "success" | "warning" | "error";

const getErrorMessage = (err: any): string => {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    if (err.message) return err.message;
    return JSON.stringify(err);
  }
  return String(err);
};

export const syncFotoToPocketBase = async (
  sourceRootDir: string,
  onProgress?: (progress: SyncFotoProgress) => void,
  onLog?: (message: string, type?: LogType) => void,
  checkCancelled?: () => boolean
): Promise<SyncFotoReport> => {
  const log = (msg: string, type: LogType = "info") => {
    if (onLog) onLog(msg, type);
  };

  const isCancelled = () => checkCancelled && checkCancelled();

  log(`Mulai memindai folder foto: ${sourceRootDir}`, "info");

  // 1. SCANNING FOLDER LOKAL VIA RUST
  if (onProgress) {
    onProgress({
      step: "scanning",
      current: 0,
      total: 100,
      message: "Memindai foto di folder lokal...",
      percent: 15,
    });
  }

  let scannedPhotos: PhotoScanItem[] = [];
  try {
    scannedPhotos = await invoke<PhotoScanItem[]>("scan_photo_directory", {
      rootDir: sourceRootDir,
    });
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }

  if (isCancelled()) {
    log("Proses dibatalkan oleh pengguna.", "warning");
    return { totalScanned: 0, matchedCount: 0, skippedUpToDate: 0, successUpload: 0, failedUpload: 0, isCancelled: true };
  }

  log(`Ditemukan ${scannedPhotos.length} file foto unik di folder & subfolder lokal.`, "success");

  // 2. FETCH DATABASE MASTER & MATCHING REAL
  if (onProgress) {
    onProgress({
      step: "matching",
      current: 0,
      total: 100,
      message: "Mencocokkan foto dengan database santri...",
      percent: 35,
    });
  }

  const masterList = await pb.collection("master").getFullList<MasterResponse>({
    fields: "id,id_pps,nama,foto,foto_subfolder",
  });

  const dbMap = new Map<string, MasterResponse>();
  masterList.forEach((rec) => {
    if (rec.id_pps) dbMap.set(rec.id_pps.trim(), rec);
  });

  const jobsToCompress: Array<{
    id_pps: string;
    source_path: string;
    output_path: string;
    subfolder: string;
    recordId: string;
  }> = [];

  let matchedCount = 0;
  let skippedCount = 0;

  for (const photo of scannedPhotos) {
    const dbRecord = dbMap.get(photo.id_pps);
    if (!dbRecord) continue;

    matchedCount++;

    const hasFotoInDb = Boolean(dbRecord.foto);
    const dbSubfolder = dbRecord.foto_subfolder || "";

    if (hasFotoInDb && dbSubfolder === photo.subfolder) {
      skippedCount++;
      continue;
    }

    const tempOutPath = `C:/Users/Public/Tibkam_Temp_Photos/${photo.id_pps}.jpg`;
    jobsToCompress.push({
      id_pps: photo.id_pps,
      source_path: photo.source_path,
      output_path: tempOutPath,
      subfolder: photo.subfolder,
      recordId: dbRecord.id,
    });
  }

  // ✨ TAMPILKAN RINCIAN CONTOH BERKAS YANG DICOCOKKAN
  if (jobsToCompress.length > 0) {
    const sample = jobsToCompress.slice(0, 3).map((j) => `${j.id_pps} (${j.subfolder || "root"})`).join(", ");
    log(`Contoh foto diproses: ${sample}...`, "info");
  }

  log(`Pencocokan DB: ${matchedCount} dari ${scannedPhotos.length} foto cocok dengan data santri.`, "info");
  log(`Status Inkremental: ${skippedCount} foto sudah versi terbaru (dilewati), ${jobsToCompress.length} foto diproses.`, "info");

  if (jobsToCompress.length === 0) {
    log("Seluruh foto lokal yang ditemukan sudah versi terbaru di database!", "success");
    return {
      totalScanned: scannedPhotos.length,
      matchedCount,
      skippedUpToDate: skippedCount,
      successUpload: 0,
      failedUpload: 0,
    };
  }

  if (isCancelled()) {
    log("Proses dibatalkan oleh pengguna.", "warning");
    return { totalScanned: scannedPhotos.length, matchedCount, skippedUpToDate: skippedCount, successUpload: 0, failedUpload: 0, isCancelled: true };
  }

  // 3. KOMPRESI GO SIDECAR
  if (onProgress) {
    onProgress({
      step: "compressing",
      current: 0,
      total: jobsToCompress.length,
      message: "Mengompresi foto via Go Sidecar...",
      percent: 50,
    });
  }

  const unlisten = await listen<string>("photo-compress-progress", (event) => {
    try {
      const parsed = JSON.parse(event.payload);
      if (parsed.type === "progress" && onProgress) {
        const pct = Math.round(50 + (parsed.current / parsed.total) * 30);
        onProgress({
          step: "compressing",
          current: parsed.current,
          total: parsed.total,
          message: parsed.message,
          percent: pct,
        });
      }
    } catch {}
  });

  try {
    await invoke("execute_photo_compressor_sidecar", {
      jobsJson: JSON.stringify(jobsToCompress),
    });
  } catch (err) {
    unlisten();
    throw new Error(getErrorMessage(err));
  }

  unlisten();
  log(`Kompresi Go sidecar selesai: ${jobsToCompress.length} foto dikompresi.`, "success");

  if (isCancelled()) {
    log("Proses dibatalkan oleh pengguna.", "warning");
    return { totalScanned: scannedPhotos.length, matchedCount, skippedUpToDate: skippedCount, successUpload: 0, failedUpload: 0, isCancelled: true };
  }

  // 4. PARALLEL BATCH UPLOAD KE POCKETBASE
  if (onProgress) {
    onProgress({
      step: "uploading",
      current: 0,
      total: jobsToCompress.length,
      message: "Mengunggah foto ke PocketBase...",
      percent: 80,
    });
  }

  let successUpload = 0;
  let failedUpload = 0;
  const CONCURRENCY_LIMIT = 8;

  for (let i = 0; i < jobsToCompress.length; i += CONCURRENCY_LIMIT) {
    if (isCancelled()) {
      log("Pengunggahan foto dibatalkan oleh pengguna.", "warning");
      break;
    }

    const chunk = jobsToCompress.slice(i, i + CONCURRENCY_LIMIT);
    const processedSoFar = Math.min(i + CONCURRENCY_LIMIT, jobsToCompress.length);
    const pct = Math.round(80 + (processedSoFar / jobsToCompress.length) * 20);

    if (onProgress) {
      onProgress({
        step: "uploading",
        current: processedSoFar,
        total: jobsToCompress.length,
        message: `Mengunggah Foto: ${processedSoFar} / ${jobsToCompress.length}`,
        percent: pct,
      });
    }

    await Promise.all(
      chunk.map(async (job) => {
        try {
          const base64Str = await invoke<string>("read_file_base64", {
            path: job.output_path,
          });

          const response = await fetch(`data:image/jpeg;base64,${base64Str}`);
          const blob = await response.blob();

          const formData = new FormData();
          formData.append("foto", blob, `${job.id_pps}.jpg`);
          formData.append("foto_subfolder", job.subfolder);

          await pb.collection("master").update(job.recordId, formData);
          successUpload++;
        } catch (err: any) {
          failedUpload++;
          log(`Gagal ID PPS ${job.id_pps}: ${getErrorMessage(err)}`, "error");
        }
      })
    );
  }

  log(`Proses Selesai! ${successUpload} foto berhasil diunggah, ${failedUpload} gagal.`, "success");

  return {
    totalScanned: scannedPhotos.length,
    matchedCount,
    skippedUpToDate: skippedCount,
    successUpload,
    failedUpload,
    isCancelled: isCancelled(),
  };
};