// src/utils/dateHelpers.ts

/**
 * 🎯 Konversi Date / String ISO ke format 'YYYY-MM-DD' berdasarkan WAKTU LOKAL (Local Browser/WIB).
 * Mengeliminasi bug pergeseran tanggal akibat konversi UTC murni.
 * (Contoh: '2026-07-24T18:30:00.000Z' -> '2026-07-25' di WIB UTC+7)
 */
export const toLocalYMD = (dateInput?: string | Date | null): string => {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * 🎯 Parsing aman string 'YYYY-MM-DD' ke Object Date Lokal pada jam 00:00:00 (Local Midnight).
 * Mencegah auto-offset dari JavaScript Engine saat membaca string YYYY-MM-DD.
 */
export const parseLocalYMD = (ymdStr?: string | null): Date | null => {
  if (!ymdStr) return null;
  const cleanStr = ymdStr.split("T")[0].split(" ")[0]; // Ambil porsi YYYY-MM-DD saja
  const parts = cleanStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
};

/**
 * 🎯 Cek apakah tanggal target berada di dalam rentang [startDate, endDate] (Inklusif).
 * Membandingkan string YYYY-MM-DD lokal agar tidak terpengaruh jam/menit/detik.
 */
export const isDateWithinRange = (
  targetDate: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const targetStr = toLocalYMD(targetDate);
  const startStr = toLocalYMD(startDate);
  const endStr = toLocalYMD(endDate);

  if (!targetStr || !startStr || !endStr) return false;

  return targetStr >= startStr && targetStr <= endStr;
};

/**
 * 🎯 Format tampilan tanggal Masehi dalam bahasa Indonesia (Contoh: "Jum'at, 25 Juli 2026")
 */
export const formatMasehiIndonesian = (
  dateInput?: string | Date | null,
  includeDayName: boolean = true
): string => {
  if (!dateInput) return "-";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("id-ID", {
    ...(includeDayName ? { weekday: "long" } : {}),
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};