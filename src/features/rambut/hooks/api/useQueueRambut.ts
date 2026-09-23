import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { parsePocketBaseError } from "@/utils/errorHandler";
import type {
  PeriodeRambutResponse,
  WajibSetorRambutResponse,
  PengurusSantriResponse,
  MasterResponse,
  WajibSetorRambutKategoriWajibOptions,
} from "@/types/pocketbase-types";
import type { WajibSetorExpanded } from "../../types";

export function useRambutStats(periodeId?: string) {
  return useQuery({
    queryKey: ["rambut-stats-real", periodeId],
    queryFn: async () => {
      if (!periodeId) {
        return { total: 0, sudah: 0, belum: 0, dispensasi: 0 };
      }

      const [totalRes, sudahRes, belumRes, dispensasiRes] = await Promise.all([
        pb.collection("wajib_setor_rambut").getList(1, 1, { filter: `periode = "${periodeId}"`, fields: "id" }),
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

export function useWajibSetorFullList(periodeId?: string) {
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
}

export function useGenerateWajibSetor() {
  const queryClient = useQueryClient();
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
            filter: 'status_aktif = true && status_domisili = "PPS" && (tingkatan ~ "Aliyah" || tingkatan ~ "Kuliah Syariah")',
            batch: 500,
          });

        const pengurusList = await pb
          .collection("pengurus_santri")
          .getFullList<PengurusSantriResponse<{ santri?: MasterResponse }>>({
            filter: "status_aktif = true",
            expand: "santri",
            batch: 500,
          });

        const personilTibkamList = await pb
          .collection("personil_tibkam")
          .getFullList<{ id_pps?: string; status_aktif?: boolean }>({
            filter: "status_aktif = true",
            fields: "id_pps,status_aktif",
            batch: 500,
          });

        const excludedPersonilSet = new Set<string>();
        personilTibkamList.forEach((p) => {
          if (p.id_pps) excludedPersonilSet.add(p.id_pps.trim());
        });

        const targetEligibleMap = new Map<
          string,
          { santriId: string; kategori: WajibSetorRambutKategoriWajibOptions }
        >();

        for (const s of masterSantri) {
          const cleanIdPps = s.id_pps ? s.id_pps.trim() : "";
          if (!cleanIdPps || excludedPersonilSet.has(cleanIdPps)) continue;

          const statusDomisili = (s.status_domisili || "").toString().trim().toUpperCase();
          if (statusDomisili !== "PPS") continue;

          const lowerTingkatan = (s.tingkatan || "").toLowerCase();
          let kategori: WajibSetorRambutKategoriWajibOptions = "aliyah";
          if (lowerTingkatan.includes("kuliah") || lowerTingkatan.includes("syariah")) {
            kategori = "kuliah_syariah";
          }
          targetEligibleMap.set(cleanIdPps, { santriId: s.id, kategori });
        }

        for (const p of pengurusList) {
          const cleanIdPps = p.id_pps ? p.id_pps.trim() : "";
          if (!cleanIdPps || !p.expand?.santri || excludedPersonilSet.has(cleanIdPps)) continue;

          const santriDomisili = (p.expand.santri.status_domisili || "").toString().trim().toUpperCase();
          if (santriDomisili && santriDomisili !== "PPS") continue;

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
        let unchangedCount = 0;
        let retainedHistoryCount = 0;

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

        if (batchCount > 0) await batch.send();

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
      queryClient.invalidateQueries({ queryKey: ["rambut-wajib-setor-list-full"] });
      queryClient.invalidateQueries({ queryKey: ["rambut-stats-real"] });
    },
  });
}