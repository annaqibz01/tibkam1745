// src/hooks/usePrinter.ts
import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { PrintMode } from '@/types/printer';
import { executePrint, LOCAL_STORAGE_PRINTER_KEY } from '@/utils/printer';

export function usePrinter(defaultMode: PrintMode = 'auto') {
  const [printMode, setPrintMode] = useState<PrintMode>(defaultMode);
  const [selectedPrinter, setSelectedPrinter] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_PRINTER_KEY) || '';
  });
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([]);
  const [isFetchingPrinters, setIsFetchingPrinters] = useState(false);

  const changeSelectedPrinter = useCallback((printerName: string) => {
    setSelectedPrinter(printerName);
    localStorage.setItem(LOCAL_STORAGE_PRINTER_KEY, printerName);
  }, []);

  const fetchPrinters = useCallback(async () => {
    setIsFetchingPrinters(true);
    try {
      const printers = await invoke<string[]>('get_available_printers');
      setAvailablePrinters(printers);
      if (printers.length > 0 && !selectedPrinter) {
        changeSelectedPrinter(printers[0]);
      }
    } catch (err) {
      console.warn('Gagal mengambil daftar printer dari OS:', err);
    } finally {
      setIsFetchingPrinters(false);
    }
  }, [selectedPrinter, changeSelectedPrinter]);

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  // Fungsi cetak fleksibel: Menerima Ref elemen / HTML dari Feature
  const print = useCallback(
    async (elementOrHtml: HTMLElement | string, overrideMode?: PrintMode) => {
      const activeMode = overrideMode || printMode;
      await executePrint(elementOrHtml, {
        mode: activeMode,
        printerName: selectedPrinter,
      });
    },
    [printMode, selectedPrinter]
  );

  return {
    printMode,
    setPrintMode,
    selectedPrinter,
    setSelectedPrinter: changeSelectedPrinter,
    availablePrinters,
    isFetchingPrinters,
    refreshPrinters: fetchPrinters,
    print,
  };
}