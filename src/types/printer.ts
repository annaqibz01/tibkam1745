// src/types/printer.ts

export type PrintMode = "off" | "auto" | "silent";

export interface PrintJobOptions {
  mode: PrintMode;
  printerName?: string;
}