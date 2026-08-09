// src/features/personil/hooks/usePersonil.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { PersonilTibkamResponse, MasterResponse } from "@/types/pocketbase-types";

export type PersonilWithExpand = PersonilTibkamResponse<{
  santri?: MasterResponse;
}>;

export interface UsePersonilParams {
  page: number;
  perPage: number;
  search: string;
  statusFilter: "all" | "aktif" | "nonaktif";
  jabatanFilter?: string;
  domisiliFilter?: string;
}

export interface UsePersonilFilterOptionsParams {
  statusFilter?: "all" | "aktif" | "nonaktif";
  jabatanFilter?: string;
  domisiliFilter?: string;
}

/**
 * 🎯 Helper Pengurutan ID PPS pada Keseluruhan Data:
 * 1. 5-digit terlebih dahulu (39058, 39566, dst)
 * 2. 8-digit setelahnya (14340232, 14380484, dst)
 * 3. Nilai angka dari terkecil ke terbesar
 */
export const sortPersonilByIdPps = <T extends PersonilWithExpand>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const strA = (a.id_pps || "").trim();
    const strB = (b.id_pps || "").trim();

    // Bandingkan panjang digit (5 digit < 8 digit)
    if (strA.length !== strB.length) {
      return strA.length - strB.length;
    }

    // Jika panjang digit sama, bandingkan nilai angkanya
    const numA = parseInt(strA, 10) || 0;
    const numB = parseInt(strB, 10) || 0;

    return numA - numB;
  });
};

export function usePersonilFilterOptions(params?: UsePersonilFilterOptionsParams) {
  const statusFilter = params?.statusFilter || "all";
  const jabatanFilter = params?.jabatanFilter || "all";
  const domisiliFilter = params?.domisiliFilter || "all";

  return useQuery({
    queryKey: [
      "personil-filter-options",
      statusFilter,
      jabatanFilter,
      domisiliFilter,
    ],
    queryFn: async () => {
      const records = await pb
        .collection("personil_tibkam")
        .getFullList<PersonilWithExpand>({
          fields: "status_aktif,jabatan_tibkam,expand.santri.domisili",
          expand: "santri",
        });

      const matchesFilter = (
        r: PersonilWithExpand,
        skipField: "status" | "jabatan" | "domisili"
      ) => {
        if (skipField !== "status") {
          if (statusFilter === "aktif" && !r.status_aktif) return false;
          if (statusFilter === "nonaktif" && r.status_aktif) return false;
        }
        if (skipField !== "jabatan" && jabatanFilter !== "all") {
          if (!r.jabatan_tibkam?.toLowerCase().includes(jabatanFilter.toLowerCase())) return false;
        }
        if (skipField !== "domisili" && domisiliFilter !== "all") {
          const dom = r.expand?.santri?.domisili || "";
          if (!dom.toLowerCase().includes(domisiliFilter.toLowerCase())) return false;
        }
        return true;
      };

      const jabatanSet = new Set<string>();
      const domisiliSet = new Set<string>();

      records.forEach((r) => {
        if (matchesFilter(r, "jabatan") && r.jabatan_tibkam?.trim()) {
          jabatanSet.add(r.jabatan_tibkam.trim());
        }
        if (matchesFilter(r, "domisili") && r.expand?.santri?.domisili?.trim()) {
          domisiliSet.add(r.expand.santri.domisili.trim());
        }
      });

      return {
        jabatanOptions: Array.from(jabatanSet).sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
        ),
        domisiliOptions: Array.from(domisiliSet).sort(),
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function usePersonil() {
  const usePersonilList = (params: UsePersonilParams) => {
    const {
      page,
      perPage,
      search,
      statusFilter,
      jabatanFilter,
      domisiliFilter,
    } = params;

    return useQuery({
      queryKey: [
        "personil_tibkam",
        page,
        perPage,
        search,
        statusFilter,
        jabatanFilter,
        domisiliFilter,
      ],
      queryFn: async () => {
        const filters: string[] = [];

        if (search) {
          const escapedSearch = search.replace(/"/g, '\\"');
          filters.push(
            `(id_pps ~ "${escapedSearch}" || jabatan_tibkam ~ "${escapedSearch}" || santri.nama ~ "${escapedSearch}")`
          );
        }

        if (statusFilter === "aktif") {
          filters.push("status_aktif = true");
        } else if (statusFilter === "nonaktif") {
          filters.push("status_aktif = false");
        }

        if (jabatanFilter && jabatanFilter !== "all") {
          filters.push(`jabatan_tibkam ~ "${jabatanFilter}"`);
        }

        if (domisiliFilter && domisiliFilter !== "all") {
          filters.push(`santri.domisili ~ "${domisiliFilter}"`);
        }

        const filter = filters.length > 0 ? filters.join(" && ") : "";

        // 1. Ambil KESELURUHAN data personil sesuai filter
        const allRecords = await pb
          .collection("personil_tibkam")
          .getFullList<PersonilWithExpand>({
            filter,
            expand: "santri",
          });

        // 2. Urutkan KESELURUHAN data berdasarkan ID PPS
        const sortedAllRecords = sortPersonilByIdPps(allRecords);

        // 3. Kalkulasi Paginasi Manual di Frontend
        const totalItems = sortedAllRecords.length;
        const totalPages = Math.ceil(totalItems / perPage) || 1;
        const startIndex = (page - 1) * perPage;
        const pageItems = sortedAllRecords.slice(startIndex, startIndex + perPage);

        return {
          page,
          perPage,
          totalItems,
          totalPages,
          items: pageItems,
        };
      },
      placeholderData: keepPreviousData,
    });
  };

  return {
    usePersonilList,
  };
}