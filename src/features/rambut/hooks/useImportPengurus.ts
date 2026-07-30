// src/features/rambut/hooks/useImportPengurus.ts
import { useState, useRef } from "react";
import { parsePocketBaseError } from "@/utils/errorHandler";
import {
  ParsedPengurusRow,
  parsePengurusExcelFile,
  executePengurusImportBatch,
  downloadPengurusTemplate,
} from "../utils/importPengurusUtils";

export function useImportPengurus(onSuccessImport?: () => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedPengurusRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setErrorMessage("");
    setParsedRows([]);

    try {
      const rows = await parsePengurusExcelFile(file);
      setParsedRows(rows);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal membaca file Excel.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleExecuteImport = async (onCloseModal: () => void) => {
    const processableRows = parsedRows.filter((r) => r.syncAction !== "invalid" && r.syncAction !== "skip");
    if (processableRows.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const updatedRows = await executePengurusImportBatch(parsedRows);
      setParsedRows(updatedRows);
      if (onSuccessImport) onSuccessImport();
      handleReset();
      onCloseModal();
    } catch (err: any) {
      const pbMsg = parsePocketBaseError(err) || "Gagal memproses transaksi paket batch data.";
      setErrorMessage(`Gagal Sinkronisasi Massal: ${pbMsg}`);

      setParsedRows((prev) =>
        prev.map((r) =>
          r.syncAction !== "invalid" && r.syncAction !== "skip"
            ? { ...r, status: "error", message: "Gagal transaksi batch" }
            : r
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const createRowsCount = parsedRows.filter((r) => r.syncAction === "create").length;
  const updateRowsCount = parsedRows.filter((r) => r.syncAction === "update").length;
  const skipRowsCount = parsedRows.filter((r) => r.syncAction === "skip").length;
  const totalProcessable = createRowsCount + updateRowsCount;

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
    handleDownloadTemplate: downloadPengurusTemplate,
  };
}