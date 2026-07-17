// useMaster.ts
import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  keepPreviousData // ✨ 1. Import helper dari TanStack Query
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { MasterResponse, MasterRecord } from "@/types/pocketbase-types";

/**
 * Parameter yang digunakan untuk filter dan pagination pada useMasterList.
 */
export interface UseMasterParams {
  page: number;
  perPage: number;
  search: string;
  statusFilter: "all" | "aktif" | "nonaktif";
}

/**
 * Custom hook utama untuk mengelola data master (data induk santri).
 * Menyediakan sub‑hook untuk query list, create, update, dan toggle status.
 */
export function useMaster() {
  const queryClient = useQueryClient();

  /**
   * Mengambil daftar data master dengan dukungan pagination, server‑side search,
   * dan filter status (aktif/nonaktif). Query key otomatis berubah saat parameter
   * berubah sehingga React Query akan mem‑fetch ulang.
   */
  const useMasterList = (params: UseMasterParams) => {
    const { page, perPage, search, statusFilter } = params;

    return useQuery({
      queryKey: ["master", page, perPage, search, statusFilter],
      queryFn: async () => {
        // Bangun filter string dinamis
        const filters: string[] = [];

        // Filter pencarian gabungan pada field nama & id_pps
        if (search) {
          const escapedSearch = search.replace(/"/g, '\\"');
          filters.push(`(nama ~ "${escapedSearch}" || id_pps ~ "${escapedSearch}")`);
        }

        // Filter status berdasarkan pilihan
        if (statusFilter === "aktif") {
          filters.push("status_aktif = true");
        } else if (statusFilter === "nonaktif") {
          filters.push("status_aktif = false");
        }

        const filter = filters.length > 0 ? filters.join(" && ") : "";

        return pb.collection("master").getList<MasterResponse>(page, perPage, {
          filter,
        });
      },
      // ✨ 2. KUNCI PERBAIKAN: Tahan data lama saat ganti page agar layar tidak melompat ke atas!
      placeholderData: keepPreviousData,
    });
  };

  /**
   * Menambah data master baru. Setelah berhasil, seluruh cache master
   * diinvalidasi agar data di UI selalu segar.
   */
  const useCreateMaster = () => {
    return useMutation({
      mutationFn: (data: Omit<MasterRecord, "id" | "created" | "updated">) =>
        pb.collection("master").create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["master"] });
      },
    });
  };

  /**
   * Memperbarui data master berdasarkan ID. Cache langsung diinvalidasi
   * agar perubahan terlihat tanpa perlu refresh halaman.
   */
  const useUpdateMaster = () => {
    return useMutation({
      mutationFn: ({
        id,
        ...data
      }: { id: string } & Partial<Omit<MasterRecord, "id" | "created" | "updated">>) =>
        pb.collection("master").update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["master"] });
      },
    });
  };

  /**
   * Soft‑delete / reaktivasi akun dengan membalikkan status_aktif.
   * Field `alasan_update_status` diisi secara otomatis sesuai aksi.
   */
  const useToggleStatusMaster = () => {
    return useMutation({
      mutationFn: async ({
        id,
        currentStatus,
      }: {
        id: string;
        currentStatus: boolean;
      }) => {
        const newStatus = !currentStatus;
        const alasan = newStatus
          ? "Aktifkan akun kembali"
          : "Nonaktifkan akun";

        return pb.collection("master").update(id, {
          status_aktif: newStatus,
          alasan_update_status: alasan,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["master"] });
      },
    });
  };

  return {
    useMasterList,
    useCreateMaster,
    useUpdateMaster,
    useToggleStatusMaster,
  };
}