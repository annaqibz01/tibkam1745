// src/features/personil/hooks/useImportPersonil.ts
import { useState, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import { pb } from "@/lib/pocketbase";
import type { MasterResponse, PersonilTibkamResponse } from "@/types/pocketbase-types";
import type { PersonilSyncReport } from "../utils/importPersonilExcel";

export interface PersonilParsedRow {
  rowNum: number;
  idPps: string;
  namaSantri: string;
  jabatan: string;
  santriRecordId: string | null;
  syncAction: "create" | "update" | "skip" | "error";
  status: "pending" | "success" | "skipped" | "error";
  message: string;
}

export function useImportPersonil(onSuccess: (report: PersonilSyncReport) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<PersonilParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownloadTemplate = () => {
    const templateData = [
      { "ID PPS": "40019", JABATAN: "DALAM 01" },
      { "ID PPS": "14380484", JABATAN: "HUMAS 11" },
      { "ID PPS": "14360453", JABATAN: "DALAM 07" },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TEMPLATE_PERSONIL");
    worksheet["!cols"] = [{ wch: 15 }, { wch: 20 }];
    XLSX.writeFile(workbook, "Template_Import_Personil_Tibkam.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setErrorMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName =
        workbook.SheetNames.find((name) => name.toLowerCase().includes("tibkam")) ||
        workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

      if (rawRows.length === 0) {
        throw new Error("File Excel kosong atau tidak memiliki data.");
      }

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

      const [masterList, personilList] = await Promise.all([
        pb.collection("master").getFullList<MasterResponse>({
          filter: 'status_domisili = "PPS"',
          fields: "id,id_pps,nama,status_domisili",
        }),
        pb.collection("personil_tibkam").getFullList<PersonilTibkamResponse>(),
      ]);

      const masterMap = new Map<string, MasterResponse>();
      masterList.forEach((m) => {
        if (m.id_pps) masterMap.set(m.id_pps.trim(), m);
      });

      const personilMap = new Map<string, PersonilTibkamResponse>();
      personilList.forEach((p) => {
        if (p.id_pps) personilMap.set(p.id_pps.trim(), p);
      });

      const processedRows: PersonilParsedRow[] = [];
      let validRowCounter = 0;

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.length === 0) continue;

        const idPpsRaw = String(row[idPpsIndex] || "").trim();
        const jabatanRaw = String(row[jabatanIndex] || "").trim();

        if (!/^\d+$/.test(idPpsRaw) || idPpsRaw === "0") continue;

        validRowCounter++;
        const matchMaster = masterMap.get(idPpsRaw);
        const matchPersonil = personilMap.get(idPpsRaw);

        let syncAction: "create" | "update" | "skip" | "error" = "create";
        let message = "";
        let santriRecordId: string | null = null;

        if (!matchMaster) {
          syncAction = "error";
          message = "Santri Tidak Ditemukan / Bukan PPS";
        } else {
          santriRecordId = matchMaster.id;
          if (!matchPersonil) {
            syncAction = "create";
            message = "Tambah Baru";
          } else {
            const isDifferent =
              !matchPersonil.status_aktif ||
              matchPersonil.jabatan_tibkam !== (jabatanRaw || "Anggota");

            if (isDifferent) {
              syncAction = "update";
              message = "Update Jabatan";
            } else {
              syncAction = "skip";
              message = "Sudah Sesuai";
            }
          }
        }

        processedRows.push({
          rowNum: validRowCounter,
          idPps: idPpsRaw,
          namaSantri: matchMaster?.nama || "Santri Tidak Ditemukan",
          jabatan: jabatanRaw || "Anggota",
          santriRecordId,
          syncAction,
          status: syncAction === "skip" ? "skipped" : "pending",
          message,
        });
      }

      setParsedRows(processedRows);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal membaca berkas Excel.");
      setParsedRows([]);
      setSelectedFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const createRowsCount = useMemo(
    () => parsedRows.filter((r) => r.syncAction === "create").length,
    [parsedRows]
  );
  const updateRowsCount = useMemo(
    () => parsedRows.filter((r) => r.syncAction === "update").length,
    [parsedRows]
  );
  const skipRowsCount = useMemo(
    () => parsedRows.filter((r) => r.syncAction === "skip" || r.syncAction === "error").length,
    [parsedRows]
  );
  const totalProcessable = createRowsCount + updateRowsCount;

  const handleExecuteImport = async (onDone?: () => void) => {
    if (totalProcessable === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const processableRows = parsedRows.filter(
        (r) => r.syncAction === "create" || r.syncAction === "update"
      );

      const BATCH_LIMIT = 150;
      let batch = pb.createBatch();
      let batchCount = 0;

      for (const row of processableRows) {
        if (!row.santriRecordId) continue;

        const payload = {
          id_pps: row.idPps,
          santri: row.santriRecordId,
          jabatan_tibkam: row.jabatan,
          status_aktif: true,
        };

        if (row.syncAction === "create") {
          batch.collection("personil_tibkam").create(payload);
        } else {
          const existing = await pb
            .collection("personil_tibkam")
            .getFirstListItem(`id_pps = "${row.idPps}"`);
          batch.collection("personil_tibkam").update(existing.id, payload);
        }

        batchCount++;
        if (batchCount >= BATCH_LIMIT) {
          await batch.send();
          batch = pb.createBatch();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.send();
      }

      setParsedRows((prev) =>
        prev.map((r) =>
          r.syncAction === "create" || r.syncAction === "update"
            ? { ...r, status: "success", message: "Berhasil Disimpan" }
            : r
        )
      );

      onSuccess({
        inserted: createRowsCount,
        updated: updateRowsCount,
        softDeleted: 0,
        skipped: skipRowsCount,
      });

      if (onDone) onDone();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses impor transaksi database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    fileInputRef,
    selectedFile,
    parsedRows,
    isParsing,
    isSubmitting,
    errorMessage,
    createRowsCount,
    updateRowsCount,
    skipRowsCount,
    totalProcessable,
    handleFileUpload,
    handleExecuteImport,
    handleReset,
    handleDownloadTemplate,
  };
}