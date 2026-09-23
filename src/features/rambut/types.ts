// src/features/rambut/types.ts
import type {
  PeriodeRambutResponse,
  WajibSetorRambutResponse,
  RiwayatSetorRambutResponse,
  MasterResponse,
  PeriodeRambutStatusPeriodeOptions,
} from "@/types/pocketbase-types";

export interface CreatePeriodePayload {
  nama_periode: string;
  bulan_hijriyah_angka: number;
  tahun_hijriyah: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status_periode?: PeriodeRambutStatusPeriodeOptions;
}

export interface ExecuteSetorPayload {
  wajibSetorId: string;
  santriId: string;
  id_pps: string;
  periodeId: string;
  catatan?: string;
}

export interface DispensasiPayload {
  wajibSetorId: string;
  santriId: string;
  id_pps: string;
  periodeId: string;
  catatan: string;
}

export type WajibSetorExpanded = WajibSetorRambutResponse<{
  santri?: MasterResponse;
}>;

export type RiwayatSetorExpanded = RiwayatSetorRambutResponse<{
  santri?: MasterResponse;
  petugas_eksekutor?: { name: string; username: string };
  periode?: PeriodeRambutResponse;
}>;