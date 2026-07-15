// src/hooks/useRambut.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { pb } from "../services/pocketbase";
import { ClientResponseError } from "pocketbase";
import { dapatkanDetailWis } from "../utils/waktuIstiwa";
import type {
  PeriodeRambutResponse,
  WajibSetorRambutResponse,
  RiwayatSetorRambutResponse,
  PengurusSantriResponse,
  MasterResponse,
  PeriodeRambutStatusPeriodeOptions,
  WajibSetorRambutKategoriWajibOptions,
  WajibSetorRambutStatusSetorOptions,
} from "../types/pocketbase-types";

// 🌙 Helper Format Tanggal Hijriyah dari ISO Date
export const formatHijriDate = (dateInput?: string | Date | null): string => {
  if (!dateInput) return "-";

  const str = dateInput.toString().trim();

  // 1. Jika input sudah berupa string Hijriyah (misal: "29/01/1448 H" atau "1 Muharram 1448 H")
  if (/H$/i.test(str) || /^[\d]{1,2}[\/\s]/.test(str)) {
    const cleanStr = str.replace(/\s*H+/gi, "").trim();
    return `${cleanStr} H`;
  }

  // 2. Jika input berupa Date ISO (misal: "2026-07-14T00:00:00.000Z")
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";

    const raw = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);

    const clean = raw.replace(/AH|M/g, "").replace(/\s+/g, " ").replace(/\s*H+/gi, "").trim();
    return `${clean} H`;
  } catch {
    return "-";
  }
};

// 🔢 Helper Parser Numerik ID PPS (Mendukung 5 Digit & 8 Digit)
export const parseNumericIdPps = (val?: string | number): number => {
  if (!val) return 0;
  const digits = String(val).replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
};

function parsePocketBaseError(error: unknown): string {
  if (error instanceof ClientResponseError) {
    if (error.status === 403 || error.status === 400) {
      return error.response?.message || "Akses ditolak atau data tidak valid.";
    }
    return error.response?.message || error.message || "Gagal memproses data di PocketBase.";
  }
  if (error instanceof Error) return error.message;
  return "Terjadi kesalahan yang tidak diketahui.";
}

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

export type WajibSetorExpanded = WajibSetorRambutResponse<{
  santri?: MasterResponse;
}>;

export type RiwayatSetorExpanded = RiwayatSetorRambutResponse<{
  santri?: MasterResponse;
  petugas_eksekutor?: { name: string; username: string };
  periode?: PeriodeRambutResponse;
}>;

export function useRambutStats(periodeId?: string) {
  return useQuery({
    queryKey: ["rambut-stats-real", periodeId],
    queryFn: async () => {
      if (!periodeId) {
        return { total: 0, sudah: 0, belum: 0, dispensasi: 0 };
      }

      const [totalRes, sudahRes, belumRes, dispensasiRes] = await Promise.all([
        pb.collection("wajib_setor_rambut").getList(1, 1, {
          filter: `periode = "${periodeId}"`,
          fields: "id",
        }),
        pb.collection("wajib_setor_rambut").getList(1, 1, {
          filter: `periode = "${periodeId}" && status_setor = "sudah"`,
          fields: "id",
        }),
        pb.collection("wajib_setor_rambut").getList(1, 1, {
          filter: `periode = "${periodeId}" && status_setor = "belum"`,
          fields: "id",
        }),
        pb.collection("wajib_setor_rambut").getList(1, 1, {
          filter: `periode = "${periodeId}" && status_setor = "dispensasi"`,
          fields: "id",
        }),
      ]);

      return {
        total: totalRes.totalItems,
        sudah: sudahRes.totalItems,
        belum: belumRes.totalItems,
        dispensasi: dispensasiRes.totalItems,
      };
    },
    enabled: !!periodeId,
    staleTime: 1000 * 10,
  });
}

export function useRambut() {
  const queryClient = useQueryClient();

  const useActivePeriode = () => {
    return useQuery<PeriodeRambutResponse | null>({
      queryKey: ["rambut-periode-aktif"],
      queryFn: async () => {
        try {
          return await pb
            .collection("periode_rambut")
            .getFirstListItem<PeriodeRambutResponse>('status_periode = "aktif"');
        } catch {
          return null;
        }
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  const usePeriodeList = () => {
    return useQuery<PeriodeRambutResponse[]>({
      queryKey: ["rambut-periode-list"],
      queryFn: async () => {
        return await pb
          .collection("periode_rambut")
          .getFullList<PeriodeRambutResponse>({ sort: "-created" });
      },
    });
  };

  const useCreatePeriode = () => {
    return useMutation({
      mutationFn: async (payload: CreatePeriodePayload) => {
        try {
          return await pb
            .collection("periode_rambut")
            .create<PeriodeRambutResponse>({
              ...payload,
              status_periode: payload.status_periode || "draft",
            });
        } catch (error) {
          throw new Error(parsePocketBaseError(error));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rambut-periode-list"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-periode-aktif"] });
      },
    });
  };

  const useGenerateWajibSetor = () => {
    return useMutation({
      mutationFn: async (periodeId: string) => {
        try {
          const periode = await pb
            .collection("periode_rambut")
            .getOne<PeriodeRambutResponse>(periodeId);
          if (!periode) throw new Error("Periode tidak ditemukan.");

          const masterSantri = await pb
            .collection("master")
            .getFullList<MasterResponse>({
              filter:
                'status_aktif = true && (tingkatan ~ "Aliyah" || tingkatan ~ "Kuliah Syariah")',
              batch: 500,
            });

          const pengurusList = await pb
            .collection("pengurus_santri")
            .getFullList<PengurusSantriResponse>({
              filter: "status_aktif = true",
              batch: 500,
            });

          const targetEligibleMap = new Map<
            string,
            { santriId: string; kategori: WajibSetorRambutKategoriWajibOptions }
          >();

          for (const s of masterSantri) {
            const cleanIdPps = s.id_pps ? s.id_pps.trim() : "";
            if (!cleanIdPps) continue;

            const lowerTingkatan = (s.tingkatan || "").toLowerCase();
            let kategori: WajibSetorRambutKategoriWajibOptions = "aliyah";
            if (
              lowerTingkatan.includes("kuliah") ||
              lowerTingkatan.includes("syariah")
            ) {
              kategori = "kuliah_syariah";
            }
            targetEligibleMap.set(cleanIdPps, { santriId: s.id, kategori });
          }

          for (const p of pengurusList) {
            const cleanIdPps = p.id_pps ? p.id_pps.trim() : "";
            if (!cleanIdPps) continue;
            if (!targetEligibleMap.has(cleanIdPps)) {
              targetEligibleMap.set(cleanIdPps, {
                santriId: p.santri,
                kategori: "pengurus_petugas",
              });
            }
          }

          const existingQueue = await pb
            .collection("wajib_setor_rambut")
            .getFullList<WajibSetorRambutResponse>({
              filter: `periode = "${periodeId}"`,
              batch: 500,
            });

          const existingMap = new Map<string, WajibSetorRambutResponse>();
          existingQueue.forEach((item) => {
            if (item.id_pps) existingMap.set(item.id_pps.trim(), item);
          });

          let batch = pb.createBatch();
          let batchCount = 0;
          let addedCount = 0;
          let removedCount = 0;
          let retainedHistoryCount = 0;
          let unchangedCount = 0;

          for (const [idPps, info] of targetEligibleMap.entries()) {
            if (!existingMap.has(idPps)) {
              batch.collection("wajib_setor_rambut").create({
                periode: periodeId,
                santri: info.santriId,
                id_pps: idPps,
                kategori_wajib: info.kategori,
                status_setor: "belum",
              });
              addedCount++;
              batchCount++;

              if (batchCount >= 100) {
                await batch.send();
                batch = pb.createBatch();
                batchCount = 0;
              }
            } else {
              unchangedCount++;
            }
          }

          for (const [idPps, record] of existingMap.entries()) {
            if (!targetEligibleMap.has(idPps)) {
              if (record.status_setor === "belum") {
                batch.collection("wajib_setor_rambut").delete(record.id);
                removedCount++;
                batchCount++;

                if (batchCount >= 100) {
                  await batch.send();
                  batch = pb.createBatch();
                  batchCount = 0;
                }
              } else {
                retainedHistoryCount++;
              }
            }
          }

          if (batchCount > 0) {
            await batch.send();
          }

          return {
            addedCount,
            removedCount,
            retainedHistoryCount,
            unchangedCount,
          };
        } catch (error) {
          throw new Error(parsePocketBaseError(error));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rambut-wajib-setor-list"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-stats-real"] });
      },
    });
  };

  // FETCH ANTREAN WAJIB SETOR LENGKAP PER PERIODE
  const useWajibSetorFullList = (periodeId?: string) => {
    return useQuery({
      queryKey: ["rambut-wajib-setor-list-full", periodeId],
      queryFn: async () => {
        if (!periodeId) return [];
        return await pb
          .collection("wajib_setor_rambut")
          .getFullList<WajibSetorExpanded>({
            filter: `periode = "${periodeId}"`,
            expand: "santri",
            batch: 500,
          });
      },
      enabled: !!periodeId,
      staleTime: 1000 * 15,
    });
  };

  const useExecuteSetorRambut = () => {
    return useMutation({
      mutationFn: async (payload: ExecuteSetorPayload) => {
        try {
          const nowIso = new Date().toISOString();
          const detailWis = dapatkanDetailWis();
          const currentUserId = pb.authStore.model?.id || "";

          const updatedWajibSetor = await pb
            .collection("wajib_setor_rambut")
            .update<WajibSetorRambutResponse>(payload.wajibSetorId, {
              status_setor: "sudah",
              tanggal_setor: nowIso,
            });

          await pb.collection("riwayat_setor_rambut").create({
            wajib_setor: payload.wajibSetorId,
            santri: payload.santriId,
            id_pps: payload.id_pps,
            periode: payload.periodeId,
            tanggal_setor: nowIso,
            waktu_wis: detailWis.stringLengkap,
            petugas_eksekutor: currentUserId,
            catatan: payload.catatan || "",
          });

          return updatedWajibSetor;
        } catch (error) {
          throw new Error(parsePocketBaseError(error));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rambut-wajib-setor-list-full"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-riwayat-list"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-stats-real"] });
      },
    });
  };

  const useRiwayatSetorList = (periodeId?: string) => {
    return useQuery({
      queryKey: ["rambut-riwayat-list", periodeId],
      queryFn: async () => {
        const filter = periodeId ? `periode = "${periodeId}"` : "";
        return await pb
          .collection("riwayat_setor_rambut")
          .getFullList<RiwayatSetorExpanded>({
            filter,
            expand: "santri,petugas_eksekutor,periode",
            sort: "-tanggal_setor",
            batch: 500,
          });
      },
      enabled: !!periodeId,
      placeholderData: keepPreviousData,
    });
  };

  const useDispensasiRambut = () => {
    return useMutation({
      mutationFn: async ({
        wajibSetorId,
        catatan,
      }: {
        wajibSetorId: string;
        catatan: string;
      }) => {
        try {
          return await pb
            .collection("wajib_setor_rambut")
            .update(wajibSetorId, { status_setor: "dispensasi" });
        } catch (error) {
          throw new Error(parsePocketBaseError(error));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rambut-wajib-setor-list-full"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-stats-real"] });
      },
    });
  };

  const useUpdateStatusPeriode = () => {
    return useMutation({
      mutationFn: async ({
        periodeId,
        status,
      }: {
        periodeId: string;
        status: PeriodeRambutStatusPeriodeOptions;
      }) => {
        try {
          if (status === "aktif") {
            const activeList = await pb
              .collection("periode_rambut")
              .getFullList<PeriodeRambutResponse>({ filter: 'status_periode = "aktif"' });

            for (const item of activeList) {
              if (item.id !== periodeId) {
                await pb.collection("periode_rambut").update(item.id, { status_periode: "draft" });
              }
            }
          }

          return await pb.collection("periode_rambut").update(periodeId, { status_periode: status });
        } catch (error) {
          throw new Error(parsePocketBaseError(error));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rambut-periode-list"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-periode-aktif"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-wajib-setor-list-full"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-stats-real"] });
      },
    });
  };

  const useDeletePeriode = () => {
    return useMutation({
      mutationFn: async (periodeId: string) => {
        try {
          const queueItems = await pb
            .collection("wajib_setor_rambut")
            .getFullList({ filter: `periode = "${periodeId}"`, fields: "id" });

          if (queueItems.length > 0) {
            let batch = pb.createBatch();
            let count = 0;
            for (const item of queueItems) {
              batch.collection("wajib_setor_rambut").delete(item.id);
              count++;
              if (count >= 100) {
                await batch.send();
                batch = pb.createBatch();
                count = 0;
              }
            }
            if (count > 0) await batch.send();
          }

          return await pb.collection("periode_rambut").delete(periodeId);
        } catch (error) {
          throw new Error(parsePocketBaseError(error));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rambut-periode-list"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-periode-aktif"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-wajib-setor-list-full"] });
        queryClient.invalidateQueries({ queryKey: ["rambut-stats-real"] });
      },
    });
  };

  return {
    useActivePeriode,
    usePeriodeList,
    useCreatePeriode,
    useUpdateStatusPeriode,
    useDeletePeriode,
    useGenerateWajibSetor,
    useWajibSetorFullList,
    useExecuteSetorRambut,
    useDispensasiRambut,
    useRiwayatSetorList,
    useRambutStats,
  };
}