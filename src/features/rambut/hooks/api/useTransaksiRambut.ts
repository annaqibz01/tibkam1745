import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { parsePocketBaseError } from "@/utils/errorHandler";
import { dapatkanDetailWis } from "@/utils/waktuIstiwa";
import { isDateWithinRange } from "@/utils/dateHelpers";
import type { PeriodeRambutResponse, WajibSetorRambutResponse } from "@/types/pocketbase-types";
import type { ExecuteSetorPayload, DispensasiPayload, RiwayatSetorExpanded } from "../../types";

export function useExecuteSetorRambut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExecuteSetorPayload) => {
      try {
        const currentUser = pb.authStore.record || pb.authStore.model;
        const isAdmin = currentUser?.role === "admin" || currentUser?.role === "admin_rambut";

        const periode = await pb
          .collection("periode_rambut")
          .getOne<PeriodeRambutResponse>(payload.periodeId);
        if (!periode) throw new Error("Periode tidak ditemukan.");

        if (!isAdmin) {
          if (periode.status_periode !== "aktif") {
            throw new Error(`Setor ditolak! Periode "${periode.nama_periode}" tidak dalam status AKTIF.`);
          }

          if (!isDateWithinRange(new Date(), periode.tanggal_mulai, periode.tanggal_selesai)) {
            throw new Error(`Setor ditolak! Hari ini berada di luar jadwal operasional periode "${periode.nama_periode}".`);
          }
        }

        const nowIso = new Date().toISOString();
        const detailWis = dapatkanDetailWis();
        const currentUserId = currentUser?.id || "";

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
}

export function useDispensasiRambut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DispensasiPayload) => {
      try {
        const currentUser = pb.authStore.record || pb.authStore.model;
        const isAdmin = currentUser?.role === "admin" || currentUser?.role === "admin_rambut";

        const periode = await pb
          .collection("periode_rambut")
          .getOne<PeriodeRambutResponse>(payload.periodeId);
        if (!periode) throw new Error("Periode tidak ditemukan.");

        if (!isAdmin) {
          if (periode.status_periode !== "aktif") {
            throw new Error(`Pemberian izin ditolak! Periode "${periode.nama_periode}" tidak dalam status AKTIF.`);
          }

          if (!isDateWithinRange(new Date(), periode.tanggal_mulai, periode.tanggal_selesai)) {
            throw new Error(`Pemberian izin ditolak! Hari ini berada di luar jadwal operasional periode "${periode.nama_periode}".`);
          }
        }

        const nowIso = new Date().toISOString();
        const detailWis = dapatkanDetailWis();
        const currentUserId = currentUser?.id || "";

        const updatedWajibSetor = await pb
          .collection("wajib_setor_rambut")
          .update(payload.wajibSetorId, {
            status_setor: "dispensasi",
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
          catatan: `[DISPENSASI]: ${payload.catatan || "Izin berhalangan"}`,
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
}

export function useRiwayatSetorList(periodeId?: string) {
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
}