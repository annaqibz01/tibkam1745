// src/features/rambut/utils/importPengurusUtils.ts
import * as XLSX from "xlsx";
import { pb } from "@/lib/pocketbase";

export interface ParsedPengurusRow {
  rowNum: number;
  idPps: string;
  namaSantri: string;
  santriId?: string;
  jabatan: string;
  existingId?: string;
  oldJabatan?: string;
  syncAction: "create" | "update" | "skip" | "invalid";
  status: "pending" | "success" | "error" | "skipped";
  message: string;
}

/**
 * 🛠️ 1. Downloader Template File Excel
 */
export const downloadPengurusTemplate = () => {
  const templateData = [
    { "ID PPS": "14400367", JABATAN: "Kesehatan Daerah L" },
    { "ID PPS": "14422341", JABATAN: "Operator Daerah L" },
    { "ID PPS": "14390923", JABATAN: "Wakil Persada L" },
  ];
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pengurus");
  XLSX.writeFile(wb, "Template_Import_Pengurus_Petugas.xlsx");
};

/**
 * 🛠️ 2. Parser File Excel + Grouping Double Jabatan + Filter Status Domisili PPS & Tingkatan
 */
export const parsePengurusExcelFile = async (
  file: File,
): Promise<ParsedPengurusRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: "",
  });

  if (rawJson.length === 0) {
    throw new Error("File Excel kosong atau tidak memiliki baris data.");
  }

  const sampleRow = rawJson[0];
  const availableHeaders = Object.keys(sampleRow);

  const idPpsHeader = availableHeaders.find(
    (h) => h.trim().toUpperCase() === "ID PPS",
  );
  const jabatanHeader = availableHeaders.find(
    (h) => h.trim().toUpperCase() === "JABATAN",
  );

  if (!idPpsHeader || !jabatanHeader) {
    throw new Error(
      "Header kolom tidak valid! Pastikan Excel memiliki kolom 'ID PPS' dan 'JABATAN'.",
    );
  }

  // 🌟 A. Grouping ID PPS (Gabung Double Jabatan + Case-Insensitive Deduplication)
  const groupedMap = new Map<
    string,
    { idPps: string; jabatans: string[]; rowNums: number[] }
  >();

  rawJson.forEach((row, idx) => {
    const rawIdPps = String(row[idPpsHeader] || "").trim();
    const rawJabatan = String(row[jabatanHeader] || "").trim();

    if (!rawIdPps) return;

    if (!groupedMap.has(rawIdPps)) {
      groupedMap.set(rawIdPps, { idPps: rawIdPps, jabatans: [], rowNums: [] });
    }

    const group = groupedMap.get(rawIdPps)!;
    group.rowNums.push(idx + 2);

    if (rawJabatan) {
      // 🛠️ FIX: Cek duplikasi secara Case-Insensitive (abaikan beda huruf besar/kecil)
      const isDuplicate = group.jabatans.some(
        (existingJabatan) =>
          existingJabatan.trim().toLowerCase() === rawJabatan.toLowerCase(),
      );

      // Jika belum ada (secara arti kata), masukkan variasi tulisan pertama yang paling rapi
      if (!isDuplicate) {
        group.jabatans.push(rawJabatan);
      }
    }
  });

  const uniqueGroupedRows = Array.from(groupedMap.values());
  const uniqueIds = uniqueGroupedRows.map((g) => g.idPps);

  // 🌟 B. Fetch Existing Pengurus
  const existingPengurusMap = new Map<
    string,
    { recordId: string; jabatan: string }
  >();
  try {
    const currentPengurusList = await pb
      .collection("pengurus_santri")
      .getFullList();
    currentPengurusList.forEach((rec) => {
      if (rec.id_pps) {
        existingPengurusMap.set(String(rec.id_pps).trim(), {
          recordId: rec.id,
          jabatan: String(rec.jabatan || "").trim(),
        });
      }
    });
  } catch (err) {
    console.warn(
      "[Smart Sync Warning] Gagal fetch data pengurus existing.",
      err,
    );
  }

  // 🌟 C. Chunked Bulk Lookup Master Santri (Include Fields: tingkatan & status_domisili)
  const santriMap = new Map<
    string,
    { id: string; nama: string; tingkatan: string; status_domisili: string }
  >();
  if (uniqueIds.length > 0) {
    const chunkSize = 50;
    for (let i = 0; i < uniqueIds.length; i += chunkSize) {
      const chunkIds = uniqueIds.slice(i, i + chunkSize);
      const filterQuery = chunkIds.map((id) => `id_pps = "${id}"`).join(" || ");

      try {
        const masterRecords = await pb.collection("master").getFullList({
          filter: filterQuery,
          fields: "id,id_pps,nama,tingkatan,status_domisili",
        });

        masterRecords.forEach((rec) => {
          if (rec.id_pps) {
            santriMap.set(rec.id_pps.trim(), {
              id: rec.id,
              nama: rec.nama || "Tanpa Nama",
              tingkatan: rec.tingkatan || "",
              status_domisili: rec.status_domisili || "",
            });
          }
        });
      } catch (err) {
        console.error("Gagal lookup master data:", err);
      }
    }
  }

  // 🌟 D. Matching State: Filter Status Domisili PPS & Tingkatan Aliyah/Syariah
  return uniqueGroupedRows.map((group) => {
    const combinedJabatan = group.jabatans.join(" / ") || "Pengurus / Petugas";
    const foundSantri = santriMap.get(group.idPps);
    const existingPengurus = existingPengurusMap.get(group.idPps);

    // 1. Validasi ID PPS Terdaftar
    if (!foundSantri) {
      return {
        rowNum: group.rowNums[0],
        idPps: group.idPps,
        namaSantri: "Santri Tidak Ditemukan",
        jabatan: combinedJabatan,
        syncAction: "invalid",
        status: "pending",
        message: "ID PPS tidak terdaftar di Master",
      };
    }

    // 2. Filter Status Domisili: HARUS PPS (Bukan LPPS / Non-Mukim)
    const statusDomisili = (foundSantri.status_domisili || "")
      .toString()
      .trim()
      .toUpperCase();
    if (statusDomisili !== "PPS") {
      return {
        rowNum: group.rowNums[0],
        idPps: group.idPps,
        namaSantri: foundSantri.nama,
        jabatan: combinedJabatan,
        syncAction: "invalid",
        status: "skipped",
        message: `Dilewati (Status Domisili ${statusDomisili || "LPPS"} / Bukan Mukim PPS)`,
      };
    }

    // 3. Filter Tingkatan: Aliyah & Kuliah Syariah Otomatis Dilewati (Sudah masuk Wajib Setor)
    const lowerTingkatan = (foundSantri.tingkatan || "").toLowerCase();
    const isAliyahOrSyariah =
      lowerTingkatan.includes("aliyah") ||
      lowerTingkatan.includes("kuliah") ||
      lowerTingkatan.includes("syariah");

    if (isAliyahOrSyariah) {
      return {
        rowNum: group.rowNums[0],
        idPps: group.idPps,
        namaSantri: foundSantri.nama,
        jabatan: combinedJabatan,
        syncAction: "invalid",
        status: "skipped",
        message: "Otomatis Wajib Setor (Aliyah/Syariah)",
      };
    }

    // 4. Penentuan Aksi Import (Create / Update / Skip)
    let action: "create" | "update" | "skip" = "create";
    let msg = "Akan Ditambahkan";

    if (existingPengurus) {
      const isSameJabatan =
        existingPengurus.jabatan.trim().toLowerCase() ===
        combinedJabatan.toLowerCase();

      if (isSameJabatan) {
        action = "skip";
        msg = "Sama (Dilewati)";
      } else {
        action = "update";
        msg = `Ubah: "${existingPengurus.jabatan}" ➔ "${combinedJabatan}"`;
      }
    }

    return {
      rowNum: group.rowNums[0],
      idPps: group.idPps,
      santriId: foundSantri.id,
      namaSantri: foundSantri.nama,
      jabatan: combinedJabatan,
      existingId: existingPengurus?.recordId,
      oldJabatan: existingPengurus?.jabatan,
      syncAction: action,
      status: "pending",
      message: msg,
    };
  });
};

/**
 * 🛠️ 3. Batch Transaction Execution Engine
 */
export const executePengurusImportBatch = async (
  parsedRows: ParsedPengurusRow[],
): Promise<ParsedPengurusRow[]> => {
  const updatedRows = [...parsedRows];
  let batch = pb.createBatch();
  let batchActionCount = 0;

  for (let i = 0; i < updatedRows.length; i++) {
    const row = updatedRows[i];
    if (row.syncAction === "invalid") continue;

    if (row.syncAction === "skip") {
      updatedRows[i] = {
        ...row,
        status: "skipped",
        message: "Dilewati (Tidak Berubah)",
      };
    } else if (row.syncAction === "update" && row.existingId) {
      batch.collection("pengurus_santri").update(row.existingId, {
        jabatan: row.jabatan,
        status_aktif: true,
        ...(row.santriId ? { santri: row.santriId } : {}),
      });
      batchActionCount++;
      updatedRows[i] = {
        ...row,
        status: "success",
        message: "Jabatan Diperbarui",
      };
    } else if (row.syncAction === "create") {
      const payload: Record<string, any> = {
        id_pps: row.idPps,
        jabatan: row.jabatan,
        status_aktif: true,
      };
      if (row.santriId) payload.santri = row.santriId;

      batch.collection("pengurus_santri").create(payload);
      batchActionCount++;
      updatedRows[i] = {
        ...row,
        status: "success",
        message: "Berhasil Ditambahkan",
      };
    }

    if (batchActionCount >= 100) {
      await batch.send();
      batch = pb.createBatch();
      batchActionCount = 0;
    }
  }

  if (batchActionCount > 0) {
    await batch.send();
  }

  return updatedRows;
};
