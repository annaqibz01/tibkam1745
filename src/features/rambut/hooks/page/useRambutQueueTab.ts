import { useState, useMemo } from "react";
import { useWajibSetorFullList } from "../api/useQueueRambut";
import { parseNumericIdPps } from "@/utils/userHelpers";
import type { WajibSetorRambutStatusSetorOptions } from "@/types/pocketbase-types";

export function useRambutQueueTab(currentPeriodeId?: string, perPage: number = 15) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WajibSetorRambutStatusSetorOptions>("all");

  const {
    data: fullQueueData = [],
    isLoading: isQueueLoading,
    refetch: refetchQueue,
  } = useWajibSetorFullList(currentPeriodeId);

  const filteredSortedQueue = useMemo(() => {
    const list = fullQueueData.filter((item) => {
      const santriNama = item.expand?.santri?.nama || "";
      const matchSearch =
        !search ||
        item.id_pps.toLowerCase().includes(search.toLowerCase()) ||
        santriNama.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || item.status_setor === statusFilter;
      return matchSearch && matchStatus;
    });

    return list.sort(
      (a, b) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps)
    );
  }, [fullQueueData, search, statusFilter]);

  const totalItems = filteredSortedQueue.length;
  const totalPages = Math.ceil(totalItems / perPage);

  const paginatedQueueItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredSortedQueue.slice(start, start + perPage);
  }, [filteredSortedQueue, page, perPage]);

  return {
    page,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paginatedQueueItems,
    totalItems,
    totalPages,
    isQueueLoading,
    refetchQueue,
  };
}