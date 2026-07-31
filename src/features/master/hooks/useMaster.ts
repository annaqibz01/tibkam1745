// src/features/master/hooks/useMaster.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { MasterResponse, MasterRecord } from "@/types/pocketbase-types";

export interface UseMasterParams {
  page: number;
  perPage: number;
  search: string;
  statusFilter: "all" | "aktif" | "nonaktif";
  tingkatanFilter?: string;
  kelasFilter?: string;
  statusDomisiliFilter?: string;
  domisiliFilter?: string;
}

export interface UseMasterFilterOptionsParams {
  statusFilter?: "all" | "aktif" | "nonaktif";
  tingkatanFilter?: string;
  kelasFilter?: string;
  statusDomisiliFilter?: string;
  domisiliFilter?: string;
}

/**
 * 🚀 Hook Interdependen: Menghasilkan opsi filter yang saling menyaring secara dinamis (Cascading)
 */
export function useMasterFilterOptions(params?: UseMasterFilterOptionsParams) {
  const statusFilter = params?.statusFilter || "all";
  const tingkatanFilter = params?.tingkatanFilter || "all";
  const kelasFilter = params?.kelasFilter || "all";
  const statusDomisiliFilter = params?.statusDomisiliFilter || "all";
  const domisiliFilter = params?.domisiliFilter || "all";

  return useQuery({
    queryKey: [
      "master-filter-options",
      statusFilter,
      tingkatanFilter,
      kelasFilter,
      statusDomisiliFilter,
      domisiliFilter,
    ],
    queryFn: async () => {
      const records = await pb.collection("master").getFullList<MasterResponse>({
        fields: "status_aktif,tingkatan,kelas,status_domisili,domisili",
      });

      // Helper pencocokan kondisi filter silang
      const matchesFilter = (
        r: MasterResponse,
        skipField: "status" | "tingkatan" | "kelas" | "status_domisili" | "domisili"
      ) => {
        if (skipField !== "status") {
          if (statusFilter === "aktif" && !r.status_aktif) return false;
          if (statusFilter === "nonaktif" && r.status_aktif) return false;
        }
        if (skipField !== "tingkatan" && tingkatanFilter !== "all") {
          if (!r.tingkatan?.toLowerCase().includes(tingkatanFilter.toLowerCase())) return false;
        }
        if (skipField !== "kelas" && kelasFilter !== "all") {
          if (!r.kelas?.toLowerCase().includes(kelasFilter.toLowerCase())) return false;
        }
        if (skipField !== "status_domisili" && statusDomisiliFilter !== "all") {
          if (r.status_domisili?.trim() !== statusDomisiliFilter) return false;
        }
        if (skipField !== "domisili" && domisiliFilter !== "all") {
          if (!r.domisili?.toLowerCase().includes(domisiliFilter.toLowerCase())) return false;
        }
        return true;
      };

      const tingkatanSet = new Set<string>();
      const kelasSet = new Set<string>();
      const statusDomisiliSet = new Set<string>();
      const domisiliSet = new Set<string>();

      records.forEach((r) => {
        // Ekstrak opsi Tingkatan berdasarkan filter aktif lainnya
        if (matchesFilter(r, "tingkatan") && r.tingkatan?.trim()) {
          tingkatanSet.add(r.tingkatan.trim());
        }
        // Ekstrak opsi Kelas berdasarkan filter aktif lainnya
        if (matchesFilter(r, "kelas") && r.kelas?.trim()) {
          kelasSet.add(r.kelas.trim());
        }
        // Ekstrak opsi Status Domisili berdasarkan filter aktif lainnya
        if (matchesFilter(r, "status_domisili") && r.status_domisili?.trim()) {
          statusDomisiliSet.add(r.status_domisili.trim());
        }
        // Ekstrak opsi Kompleks Domisili berdasarkan filter aktif lainnya
        if (matchesFilter(r, "domisili") && r.domisili?.trim()) {
          const cleanDom = r.domisili.trim();
          if (cleanDom.toUpperCase() !== "PPS" && cleanDom.toUpperCase() !== "LPPS") {
            domisiliSet.add(cleanDom);
          }
        }
      });

      return {
        tingkatanOptions: Array.from(tingkatanSet).sort(),
        kelasOptions: Array.from(kelasSet).sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
        ),
        statusDomisiliOptions: Array.from(statusDomisiliSet).sort(),
        domisiliOptions: Array.from(domisiliSet).sort(),
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useMaster() {
  const queryClient = useQueryClient();

  const useMasterList = (params: UseMasterParams) => {
    const {
      page,
      perPage,
      search,
      statusFilter,
      tingkatanFilter,
      kelasFilter,
      statusDomisiliFilter,
      domisiliFilter,
    } = params;

    return useQuery({
      queryKey: [
        "master",
        page,
        perPage,
        search,
        statusFilter,
        tingkatanFilter,
        kelasFilter,
        statusDomisiliFilter,
        domisiliFilter,
      ],
      queryFn: async () => {
        const filters: string[] = [];

        if (search) {
          const escapedSearch = search.replace(/"/g, '\\"');
          filters.push(`(nama ~ "${escapedSearch}" || id_pps ~ "${escapedSearch}")`);
        }

        if (statusFilter === "aktif") {
          filters.push("status_aktif = true");
        } else if (statusFilter === "nonaktif") {
          filters.push("status_aktif = false");
        }

        if (tingkatanFilter && tingkatanFilter !== "all") {
          filters.push(`tingkatan ~ "${tingkatanFilter}"`);
        }

        if (kelasFilter && kelasFilter !== "all") {
          filters.push(`kelas ~ "${kelasFilter}"`);
        }

        if (statusDomisiliFilter && statusDomisiliFilter !== "all") {
          filters.push(`status_domisili = "${statusDomisiliFilter}"`);
        }

        if (domisiliFilter && domisiliFilter !== "all") {
          filters.push(`domisili ~ "${domisiliFilter}"`);
        }

        const filter = filters.length > 0 ? filters.join(" && ") : "";

        return pb.collection("master").getList<MasterResponse>(page, perPage, {
          filter,
        });
      },
      placeholderData: keepPreviousData,
    });
  };

  const useCreateMaster = () => {
    return useMutation({
      mutationFn: (data: Omit<MasterRecord, "id" | "created" | "updated">) =>
        pb.collection("master").create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["master"] });
        queryClient.invalidateQueries({ queryKey: ["master-filter-options"] });
      },
    });
  };

  const useUpdateMaster = () => {
    return useMutation({
      mutationFn: ({
        id,
        ...data
      }: { id: string } & Partial<Omit<MasterRecord, "id" | "created" | "updated">>) =>
        pb.collection("master").update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["master"] });
        queryClient.invalidateQueries({ queryKey: ["master-filter-options"] });
      },
    });
  };

  return {
    useMasterList,
    useCreateMaster,
    useUpdateMaster,
  };
}