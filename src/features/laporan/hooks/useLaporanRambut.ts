// src/features/laporan/hooks/useLaporanRambut.ts
import { useState, useEffect, useMemo } from "react";
import { useRambut, useRambutStats } from "@/features/rambut";
import type { PeriodeRambutResponse } from "@/types/pocketbase-types";

export type ReportType = "all" | "belum_setor" | "sudah_setor" | "riwayat";

export function useLaporanRambut() {
  const {
    useActivePeriode,
    usePeriodeList,
    useWajibSetorFullList,
    useRiwayatSetorList,
  } = useRambut();

  const { data: activePeriode } = useActivePeriode();
  const { data: periodeList = [], isLoading: isPeriodeLoading } = usePeriodeList();

  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeRambutResponse | null>(null);
  const [reportType, setReportType] = useState<ReportType>("all");
  const [filterKategori, setFilterKategori] = useState<string>("all");
  const [filterDaerah, setFilterDaerah] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  // Auto-select periode aktif/terbaru saat pertama dimuat
  useEffect(() => {
    if (!selectedPeriode) {
      if (activePeriode) {
        setSelectedPeriode(activePeriode);
      } else if (periodeList.length > 0) {
        setSelectedPeriode(periodeList[0]);
      }
    }
  }, [activePeriode, periodeList, selectedPeriode]);

  const currentPeriodeId = selectedPeriode?.id || activePeriode?.id || "";

  // Query data antrean & riwayat berdasarkan periode terpilih
  const { data: fullQueueData = [], isLoading: isQueueLoading, refetch: refetchQueue } = useWajibSetorFullList(currentPeriodeId);
  const { data: fullRiwayatData = [], isLoading: isRiwayatLoading, refetch: refetchRiwayat } = useRiwayatSetorList(currentPeriodeId);
  const { data: statsData, isLoading: isStatsLoading } = useRambutStats(currentPeriodeId);

  const stats = statsData ?? { total: 0, sudah: 0, belum: 0, dispensasi: 0 };

  // Opsi Filter Daerah Domisili Ekstrak Otomatis (A - Z)
  const daerahOptions = useMemo(() => {
    const set = new Set<string>();
    fullQueueData.forEach((item) => {
      const dom = item.expand?.santri?.domisili || item.expand?.santri?.status_domisili;
      if (dom) {
        const firstChar = dom.toString().trim().toUpperCase().charAt(0);
        if (firstChar >= "A" && firstChar <= "Z") set.add(firstChar);
      }
    });
    return Array.from(set).sort();
  }, [fullQueueData]);

  // Filter Queue Data
  const filteredQueueData = useMemo(() => {
    return fullQueueData.filter((item) => {
      if (reportType === "belum_setor" && item.status_setor !== "belum") return false;
      if (reportType === "sudah_setor" && item.status_setor !== "sudah") return false;
      if (filterKategori !== "all" && item.kategori_wajib !== filterKategori) return false;

      const dom = item.expand?.santri?.domisili || item.expand?.santri?.status_domisili || "";
      const firstChar = dom.toString().trim().toUpperCase().charAt(0);
      if (filterDaerah !== "all" && firstChar !== filterDaerah) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nama = (item.expand?.santri?.nama || "").toLowerCase();
        const idPps = (item.id_pps || "").toLowerCase();
        return nama.includes(query) || idPps.includes(query);
      }

      return true;
    });
  }, [fullQueueData, reportType, filterKategori, filterDaerah, searchQuery]);

  // Filter Audit Data
  const filteredAuditData = useMemo(() => {
    return fullRiwayatData.filter((item) => {
      const dom = item.expand?.santri?.domisili || item.expand?.santri?.status_domisili || "";
      const firstChar = dom.toString().trim().toUpperCase().charAt(0);
      if (filterDaerah !== "all" && firstChar !== filterDaerah) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nama = (item.expand?.santri?.nama || "").toLowerCase();
        const idPps = (item.id_pps || "").toLowerCase();
        const petugas = (item.expand?.petugas_eksekutor?.name || item.expand?.petugas_eksekutor?.username || "").toLowerCase();
        return nama.includes(query) || idPps.includes(query) || petugas.includes(query);
      }
      return true;
    });
  }, [fullRiwayatData, filterDaerah, searchQuery]);

  // Pagination Data
  const activeDataset = reportType === "riwayat" ? filteredAuditData : filteredQueueData;
  const totalItems = activeDataset.length;
  const totalPages = Math.ceil(totalItems / PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return activeDataset.slice(start, start + PER_PAGE);
  }, [activeDataset, page, PER_PAGE]);

  return {
    periodeList,
    selectedPeriode,
    setSelectedPeriode: (p: PeriodeRambutResponse | null) => {
      setSelectedPeriode(p);
      setPage(1);
    },
    reportType,
    setReportType: (t: ReportType) => {
      setReportType(t);
      setPage(1);
    },
    filterKategori,
    setFilterKategori: (k: string) => {
      setFilterKategori(k);
      setPage(1);
    },
    filterDaerah,
    setFilterDaerah: (d: string) => {
      setFilterDaerah(d);
      setPage(1);
    },
    daerahOptions,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q);
      setPage(1);
    },
    page,
    setPage,
    PER_PAGE,
    totalItems,
    totalPages,
    stats,
    filteredQueueData,
    filteredAuditData,
    paginatedData,
    isLoading: isPeriodeLoading || isQueueLoading || isRiwayatLoading || isStatsLoading,
    onRefresh: () => {
      refetchQueue();
      refetchRiwayat();
    },
  };
}