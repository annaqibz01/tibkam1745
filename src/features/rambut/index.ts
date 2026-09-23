// src/features/rambut/index.ts

// 🚪 Public API Gerbang Modul Layanan Rambut
export { default as RambutPage } from "./pages/Rambut";
export * from "./types";
export * from "./hooks";
export * from "./components/RambutStats";

export { parseNumericIdPps } from "@/utils/userHelpers";