// src/utils/syncExcelToPocketBase.ts
import { pb } from "../services/pocketbase";
import type { MasterRecord, MasterResponse } from "../types/pocketbase-types";

export type ExcelSantriRow = Omit<MasterRecord, "id" | "created" | "updated" | "status_aktif">;

const hasChanges = (excelRow: ExcelSantriRow, dbRecord: MasterResponse): boolean => {
  if (!dbRecord.status_aktif) return true;

  const IGNORED_FIELDS = ["alasan_update_status", "keterangan_update_domisi"];

  for (const key in excelRow) {
    if (IGNORED_FIELDS.includes(key)) continue;

    const excelVal = excelRow[key as keyof ExcelSantriRow];
    const dbVal = dbRecord[key as keyof MasterResponse];
    
    const normalize = (val: any) => (val === undefined || val === null ? "" : String(val).trim());

    if (normalize(excelVal) !== normalize(dbVal)) {
      // 🕵️‍♂️ SCOPE MATA-MATA (X-RAY SCANNER):
      // Ini akan mencetak langsung di Console browser kamu kolom mana yang tidak sama!
      console.warn(
        `🚨 [DATA BERBEDA LOG] ID PPS: ${excelRow.id_pps} | Kolom: "${key}" \n` +
        `   -> Di Excel terbaca : "${normalize(excelVal)}"\n` +
        `   -> Di PocketBase    : "${normalize(dbVal)}"`
      );
      return true; 
    }
  }
  return false; 
};

export const syncExcelToPocketBase = async (excelData: ExcelSantriRow[]): Promise<{
  inserted: number;
  updated: number;
  softDeleted: number;
  skipped: number;
}> => {
  const report = { inserted: 0, updated: 0, softDeleted: 0, skipped: 0 };
  if (!excelData || excelData.length === 0) return report;

  const existingRecords = await pb.collection("master").getFullList<MasterResponse>();
  const dbMap = new Map<string, MasterResponse>();
  existingRecords.forEach((rec) => {
    if (rec.id_pps) dbMap.set(rec.id_pps.trim(), rec);
  });

  const BATCH_LIMIT = 200; 
  let batch = pb.createBatch();
  let batchCount = 0;

  const commitBatchIfFull = async () => {
    if (batchCount >= BATCH_LIMIT) {
      await batch.send();
      batch = pb.createBatch();
      batchCount = 0;
    }
  };

  const processedExcelIds = new Set<string>();

  for (const excelRow of excelData) {
    if (!excelRow.id_pps) continue;

    const id_pps_key = excelRow.id_pps.trim();
    processedExcelIds.add(id_pps_key);

    const matchDbRecord = dbMap.get(id_pps_key);

    if (!matchDbRecord) {
      batch.collection("master").create({
        ...excelRow,
        status_aktif: true,
        alasan_update_status: "Santri baru terdaftar via sistem import massal",
      });
      report.inserted++;
      batchCount++;
      await commitBatchIfFull();
    } else {
      if (hasChanges(excelRow, matchDbRecord)) {
        batch.collection("master").update(matchDbRecord.id, {
          ...excelRow,
          status_aktif: true,
          alasan_update_status: matchDbRecord.status_aktif 
            ? "Pembaruan informasi data berkas induk" 
            : "Santri aktif kembali melalui import berkas terbaru",
        });
        report.updated++;
        batchCount++;
        await commitBatchIfFull();
      } else {
        report.skipped++;
      }
    }
  }

  for (const [id_pps, dbRecord] of dbMap.entries()) {
    if (!processedExcelIds.has(id_pps) && dbRecord.status_aktif) {
      batch.collection("master").update(dbRecord.id, {
        status_aktif: false,
        alasan_update_status: `Tidak terdaftar di Excel import terbaru pada tanggal ${new Date().toLocaleDateString("id-ID")}`,
      });
      report.softDeleted++;
      batchCount++;
      await commitBatchIfFull();
    }
  }

  if (batchCount > 0) {
    await batch.send();
  }

  return report;
};