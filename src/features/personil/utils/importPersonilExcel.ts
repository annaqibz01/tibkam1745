// src/features/personil/utils/importPersonilExcel.ts
import * as XLSX from "xlsx";
import { pb } from "@/lib/pocketbase";
import type { MasterResponse, PersonilTibkamResponse } from "@/types/pocketbase-types";

export interface PersonilExcelRow {
  id_pps: string;
  jabatan_tibkam: string;
}

export interface PersonilSyncReport {
  inserted: number;
  updated: number;
  softDeleted: number;
  skipped: number;
}

/**
 * 🔍 Parser Berkas Excel Personil
 */
export const parsePersonilExcel = async (file: File): Promise<PersonilExcelRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const sheetName =
    workbook.SheetNames.find((name) => name.toLowerCase().includes("tibkam")) ||
    workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
  if (rawRows.length === 0) return [];

  let idPpsIndex = -1;
  let jabatanIndex = -1;

  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i];
    if (!row) continue;

    row.forEach((cell, idx) => {
      const cellStr = String(cell || "").toLowerCase().trim();
      if (cellStr.includes("id pps") || cellStr === "id_pps" || cellStr === "idpps") {
        idPpsIndex = idx;
      }
      if (cellStr.includes("jabatan") || cellStr.includes("tugas")) {
        jabatanIndex = idx;
      }
    });

    if (idPpsIndex !== -1 && jabatanIndex !== -1) break;
  }

  if (idPpsIndex === -1) idPpsIndex = 1;
  if (jabatanIndex === -1) jabatanIndex = 6;

  const resultRows: PersonilExcelRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const idPpsRaw = String(row[idPpsIndex] || "").trim();
    const jabatanRaw = String(row[jabatanIndex] || "").trim();

    if (/^\d+$/.test(idPpsRaw) && idPpsRaw !== "0") {
      resultRows.push({
        id_pps: idPpsRaw,
        jabatan_tibkam: jabatanRaw || "Anggota",
      });
    }
  }

  return resultRows;
};

/**
 * ⚡ Sync Batch Import Personil ke PocketBase
 */
export const syncPersonilExcelToPocketBase = async (
  excelData: PersonilExcelRow[],
  onProgress?: (processed: number, total: number) => void
): Promise<PersonilSyncReport> => {
  const report: PersonilSyncReport = { inserted: 0, updated: 0, softDeleted: 0, skipped: 0 };
  if (!excelData || excelData.length === 0) return report;

  // 1. Ambil seluruh data master santri PPS
  const masterSantriPps = await pb
    .collection("master")
    .getFullList<MasterResponse>({
      filter: 'status_domisili = "PPS"',
      fields: "id,id_pps,status_domisili",
    });

  const masterMap = new Map<string, MasterResponse>();
  masterSantriPps.forEach((m) => {
    if (m.id_pps) masterMap.set(m.id_pps.trim(), m);
  });

  // 2. Ambil seluruh personil Tibkam terdaftar
  const existingPersonil = await pb
    .collection("personil_tibkam")
    .getFullList<PersonilTibkamResponse>();

  const dbMap = new Map<string, PersonilTibkamResponse>();
  existingPersonil.forEach((p) => {
    if (p.id_pps) dbMap.set(p.id_pps.trim(), p);
  });

  const totalItemsToProcess = excelData.length + dbMap.size;
  let processedCounter = 0;

  const BATCH_LIMIT = 150;
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

  // 3. Iterasi Data Excel
  for (const excelRow of excelData) {
    processedCounter++;
    if (onProgress) onProgress(processedCounter, totalItemsToProcess);

    const idPpsKey = excelRow.id_pps.trim();
    const matchMaster = masterMap.get(idPpsKey);

    if (!matchMaster) {
      report.skipped++;
      continue;
    }

    processedExcelIds.add(idPpsKey);
    const matchPersonilDb = dbMap.get(idPpsKey);

    const payload = {
      id_pps: idPpsKey,
      santri: matchMaster.id,
      jabatan_tibkam: excelRow.jabatan_tibkam,
      status_aktif: true,
    };

    if (!matchPersonilDb) {
      batch.collection("personil_tibkam").create(payload);
      report.inserted++;
      batchCount++;
      await commitBatchIfFull();
    } else {
      const isChanged =
        !matchPersonilDb.status_aktif ||
        matchPersonilDb.jabatan_tibkam !== excelRow.jabatan_tibkam ||
        matchPersonilDb.santri !== matchMaster.id;

      if (isChanged) {
        batch.collection("personil_tibkam").update(matchPersonilDb.id, payload);
        report.updated++;
        batchCount++;
        await commitBatchIfFull();
      } else {
        report.skipped++;
      }
    }
  }

  // 4. Soft-Delete Personil yang tidak terdaftar di Excel terbaru
  for (const [idPps, personilDb] of dbMap.entries()) {
    processedCounter++;
    if (onProgress) onProgress(processedCounter, totalItemsToProcess);

    if (!processedExcelIds.has(idPps) && personilDb.status_aktif) {
      batch.collection("personil_tibkam").update(personilDb.id, {
        status_aktif: false,
      });
      report.softDeleted++;
      batchCount++;
      await commitBatchIfFull();
    }
  }

  if (batchCount > 0) {
    await batch.send();
  }

  if (onProgress) onProgress(totalItemsToProcess, totalItemsToProcess);

  return report;
};