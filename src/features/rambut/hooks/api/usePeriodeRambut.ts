import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { parsePocketBaseError } from "@/utils/errorHandler";
import { toLocalYMD } from "@/utils/dateHelpers";
import type {
  PeriodeRambutResponse,
  PeriodeRambutStatusPeriodeOptions,
} from "@/types/pocketbase-types";
import type { CreatePeriodePayload } from "../../types";

export function useActivePeriode() {
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
}

export function usePeriodeList() {
  return useQuery<PeriodeRambutResponse[]>({
    queryKey: ["rambut-periode-list"],
    queryFn: async () => {
      return await pb
        .collection("periode_rambut")
        .getFullList<PeriodeRambutResponse>({ sort: "-created" });
    },
  });
}

export function useCreatePeriode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePeriodePayload) => {
      try {
        const existingList = await pb
          .collection("periode_rambut")
          .getFullList<PeriodeRambutResponse>();

        const startNew = toLocalYMD(payload.tanggal_mulai);
        const endNew = toLocalYMD(payload.tanggal_selesai);

        const isOverlap = existingList.some((p) => {
          const startExist = toLocalYMD(p.tanggal_mulai);
          const endExist = toLocalYMD(p.tanggal_selesai);
          return startNew <= endExist && endNew >= startExist;
        });

        if (isOverlap) {
          throw new Error("Gagal menyimpan! Rentang tanggal bertabrakan dengan periode yang sudah ada.");
        }

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
}

export function useUpdateStatusPeriode() {
  const queryClient = useQueryClient();
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
            .getFullList<PeriodeRambutResponse>({
              filter: 'status_periode = "aktif"',
            });

          const batch = pb.createBatch();

          for (const item of activeList) {
            if (item.id !== periodeId) {
              batch.collection("periode_rambut").update(item.id, { status_periode: "draft" });
            }
          }

          batch.collection("periode_rambut").update(periodeId, { status_periode: "aktif" });
          await batch.send();

          return await pb.collection("periode_rambut").getOne<PeriodeRambutResponse>(periodeId);
        }

        return await pb
          .collection("periode_rambut")
          .update(periodeId, { status_periode: status });
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
}

export function useDeletePeriode() {
  const queryClient = useQueryClient();
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
}