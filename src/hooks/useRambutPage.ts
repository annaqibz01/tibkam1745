// src/hooks/useRambutPage.ts
import React from "react";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { pb } from "../services/pocketbase";
import { useAuth } from "./useAuth";
import { useToast } from "../context/ToastContext";
import { HijriText } from "../components/shared/HijriText";
import {
  useRambut,
  useRambutStats,
  parseNumericIdPps,
  type WajibSetorExpanded,
  type CreatePeriodePayload,
} from "./useRambut";
import type { PengurusItem } from "../components/rambut/RambutQueueTable";
import type { RambutTabType } from "../components/rambut/RambutScanToolbar";
import type {
  UsersResponse,
  PeriodeRambutResponse,
  PeriodeRambutStatusPeriodeOptions,
  WajibSetorRambutStatusSetorOptions,
} from "../types/pocketbase-types";

const PER_PAGE = 15;

export function useRambutPage() {
  const { user } = useAuth();
  const currentUser = user as UsersResponse | null;
  const isAdmin = currentUser?.role === "admin";
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<RambutTabType>("queue");

  // Filter States - Queue
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | WajibSetorRambutStatusSetorOptions
  >("all");

  // Filter States - Pengurus
  const [pengurusSearch, setPengurusSearch] = useState("");
  const [pengurusDaerahFilter, setPengurusDaerahFilter] = useState("all");

  // Filter States - Audit
  const [auditSearch, setAuditSearch] = useState("");
  const [auditDateFilter, setAuditDateFilter] = useState("all");

  const [selectedPeriode, setSelectedPeriode] =
    useState<PeriodeRambutResponse | null>(null);

  // Modal Visibility States
  const [isPosOpen, setIsPosOpen] = useState(false);
  const [isImportPengurusOpen, setIsImportPengurusOpen] = useState(false);
  const [isCreatePeriodeOpen, setIsCreatePeriodeOpen] = useState(false);
  const [isManagePeriodeOpen, setIsManagePeriodeOpen] = useState(false);
  const [isManagePengurusOpen, setIsManagePengurusOpen] = useState(false);
  const [selectedExecuteItem, setSelectedExecuteItem] =
    useState<WajibSetorExpanded | null>(null);
  const [selectedDispensasiItem, setSelectedDispensasiItem] =
    useState<WajibSetorExpanded | null>(null);
  const [isConfirmGenerateOpen, setIsConfirmGenerateOpen] = useState(false);
  const [selectedDeletePengurus, setSelectedDeletePengurus] =
    useState<PengurusItem | null>(null);
  const [isDeletingPengurus, setIsDeletingPengurus] = useState(false);

  const {
    useActivePeriode,
    usePeriodeList,
    useCreatePeriode,
    useUpdateStatusPeriode,
    useDeletePeriode,
    useGenerateWajibSetor,
    useWajibSetorFullList,
    useExecuteSetorRambut,
    useRiwayatSetorList,
    useDispensasiRambut,
  } = useRambut();

  const { data: activePeriode } = useActivePeriode();
  const { data: periodeList = [], isLoading: isPeriodeListLoading } =
    usePeriodeList();
  const deletePeriodeMutation = useDeletePeriode();

  useEffect(() => {
    if (activePeriode && !selectedPeriode) {
      setSelectedPeriode(activePeriode);
    }
  }, [activePeriode, selectedPeriode]);

  const currentPeriodeId = selectedPeriode?.id || activePeriode?.id;

  const createPeriodeMutation = useCreatePeriode();
  const updateStatusPeriodeMutation = useUpdateStatusPeriode();
  const generateQueueMutation = useGenerateWajibSetor();
  const executeSetorMutation = useExecuteSetorRambut();
  const dispensasiMutation = useDispensasiRambut();

  // 1. Pengurus Data
  const {
    data: rawPengurusData = [],
    isLoading: isPengurusLoading,
    refetch: refetchPengurus,
  } = useQuery({
    queryKey: ["pengurus-santri-list"],
    queryFn: async () => {
      return await pb.collection("pengurus_santri").getFullList<PengurusItem>({
        expand: "santri",
        sort: "-created",
      });
    },
  });

  const daerahOptions = useMemo(() => {
    const set = new Set<string>();
    rawPengurusData.forEach((p) => {
      const dom =
        p.expand?.santri?.domisili || p.expand?.santri?.status_domisili;
      if (dom) {
        const cleanDom = dom.toString().trim().toUpperCase();
        const firstChar = cleanDom.charAt(0); // Ambil huruf paling depan

        // Pengaman: Pastikan berupa karakter alfabet A-Z
        if (firstChar && firstChar >= "A" && firstChar <= "Z") {
          set.add(firstChar);
        }
      }
    });
    return Array.from(set).sort(); // Urutkan alfabetis A -> Z
  }, [rawPengurusData]);

  const filteredPengurusData = useMemo(() => {
    return rawPengurusData.filter((p) => {
      // Filter Pencarian Teks (ID PPS, Nama, Jabatan)
      const santriNama = p.expand?.santri?.nama || "";
      const matchSearch =
        !pengurusSearch ||
        p.id_pps.toLowerCase().includes(pengurusSearch.toLowerCase()) ||
        santriNama.toLowerCase().includes(pengurusSearch.toLowerCase()) ||
        p.jabatan.toLowerCase().includes(pengurusSearch.toLowerCase());

      // Filter Daerah Berdasarkan Huruf Depan Kompleks
      const dom =
        p.expand?.santri?.domisili || p.expand?.santri?.status_domisili || "";
      const cleanDom = dom.toString().trim().toUpperCase();
      const firstChar = cleanDom.charAt(0); // Ekstrak huruf depan data pengurus

      // Gembok COCOK: Jika filter "all" ATAU huruf depannya sama dengan yang dipilih di filter
      const matchDaerah =
        pengurusDaerahFilter === "all" || firstChar === pengurusDaerahFilter;

      return matchSearch && matchDaerah;
    });
  }, [rawPengurusData, pengurusSearch, pengurusDaerahFilter]);
  // 2. Queue Data
  const {
    data: fullQueueData = [],
    isLoading: isQueueLoading,
    refetch: refetchQueue,
  } = useWajibSetorFullList(currentPeriodeId);

  const filteredSortedQueue = useMemo(() => {
    let list = fullQueueData.filter((item) => {
      const santriNama = item.expand?.santri?.nama || "";
      const matchSearch =
        !search ||
        item.id_pps.toLowerCase().includes(search.toLowerCase()) ||
        santriNama.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || item.status_setor === statusFilter;

      return matchSearch && matchStatus;
    });

    return list.sort(
      (a, b) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps),
    );
  }, [fullQueueData, search, statusFilter]);

  const totalItems = filteredSortedQueue.length;
  const totalPages = Math.ceil(totalItems / PER_PAGE);
  const paginatedQueueItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredSortedQueue.slice(start, start + PER_PAGE);
  }, [filteredSortedQueue, page]);

  // 3. Audit Data
  const { data: historyData = [], isLoading: isHistoryLoading } =
    useRiwayatSetorList(currentPeriodeId);

  const availableHijriDateOptions = useMemo(() => {
    if (!historyData) return [];
    const map = new Map<string, string>();
    historyData.forEach((item: any) => {
      const dateKey = (item.tanggal_setor || item.created || "").substring(
        0,
        10,
      );
      if (dateKey && !map.has(dateKey)) {
        map.set(dateKey, dateKey);
      }
    });
    return Array.from(map.keys()).map((dateStr) => ({
      value: dateStr,
      // ✅ Menggunakan Opsi A global: Bungkus label opsi filter dengan komponen kalender internal kita
      label: React.createElement(HijriText, { date: dateStr }),
    }));
  }, [historyData]);

  const filteredAuditItems = useMemo(() => {
    if (!historyData) return [];
    return historyData.filter((item: any) => {
      const santriNama = item.expand?.santri?.nama || "";
      const petugasNama =
        item.expand?.petugas_eksekutor?.name ||
        item.expand?.petugas_eksekutor?.username ||
        "";
      const catatan = item.catatan_operasional || item.catatan || "";

      const matchSearch =
        !auditSearch ||
        (item.id_pps || "").toLowerCase().includes(auditSearch.toLowerCase()) ||
        santriNama.toLowerCase().includes(auditSearch.toLowerCase()) ||
        petugasNama.toLowerCase().includes(auditSearch.toLowerCase()) ||
        catatan.toLowerCase().includes(auditSearch.toLowerCase());

      const itemDateKey = (item.tanggal_setor || item.created || "").substring(
        0,
        10,
      );
      const matchDate =
        auditDateFilter === "all" || itemDateKey === auditDateFilter;

      return matchSearch && matchDate;
    });
  }, [historyData, auditSearch, auditDateFilter]);

  // 4. Stats
  const { data: statsData, isLoading: isStatsLoading } =
    useRambutStats(currentPeriodeId);
  const stats = statsData ?? { total: 0, sudah: 0, belum: 0, dispensasi: 0 };

  // Handlers
  const handleCreatePeriode = (payload: CreatePeriodePayload) => {
    createPeriodeMutation.mutate(payload, {
      onSuccess: () => {
        showSuccess(
          `Periode ${payload.nama_periode} berhasil dibuat!`,
          "Periode Baru",
        );
        setIsCreatePeriodeOpen(false);
      },
      onError: (err) => showError(err.message, "Gagal Buat Periode"),
    });
  };

  const handleUpdateStatusPeriode = (
    periodeId: string,
    status: PeriodeRambutStatusPeriodeOptions,
  ) => {
    updateStatusPeriodeMutation.mutate(
      { periodeId, status },
      {
        onSuccess: () =>
          showSuccess(
            `Status periode diubah ke ${status.toUpperCase()}`,
            "Status Diperbarui",
          ),
        onError: (err) => showError(err.message, "Gagal Ubah Status"),
      },
    );
  };

  const handleDeletePeriode = (periodeId: string) => {
    deletePeriodeMutation.mutate(periodeId, {
      onSuccess: () => {
        showSuccess("Periode berhasil dihapus!", "Periode Dihapus");
        if (selectedPeriode?.id === periodeId) setSelectedPeriode(null);
      },
      onError: (err) => showError(err.message, "Gagal Hapus Periode"),
    });
  };

  const handleConfirmSetor = (catatan: string) => {
    if (!selectedExecuteItem || !currentPeriodeId) return;
    executeSetorMutation.mutate(
      {
        wajibSetorId: selectedExecuteItem.id,
        santriId: selectedExecuteItem.santri || "",
        id_pps: selectedExecuteItem.id_pps,
        periodeId: currentPeriodeId,
        catatan,
      },
      {
        onSuccess: () => {
          showSuccess(
            `Setor ID PPS ${selectedExecuteItem.id_pps} berhasil!`,
            "Verifikasi Sukses",
          );
          setSelectedExecuteItem(null);
        },
        onError: (err) => showError(err.message, "Gagal Verifikasi"),
      },
    );
  };

  const handleConfirmDispensasi = (catatan: string) => {
    if (!selectedDispensasiItem) return;
    dispensasiMutation.mutate(
      { wajibSetorId: selectedDispensasiItem.id, catatan },
      {
        onSuccess: () => {
          showSuccess(
            `Dispensasi ID PPS ${selectedDispensasiItem.id_pps} disimpan!`,
            "Dispensasi Disimpan",
          );
          setSelectedDispensasiItem(null);
        },
        onError: (err) => showError(err.message, "Gagal Dispensasi"),
      },
    );
  };

  const handleConfirmDeletePengurus = async () => {
    if (!selectedDeletePengurus) return;
    setIsDeletingPengurus(true);
    try {
      await pb.collection("pengurus_santri").delete(selectedDeletePengurus.id);
      showSuccess(
        `Pengurus ID PPS ${selectedDeletePengurus.id_pps} dihapus.`,
        "Berhasil Hapus",
      );
      setSelectedDeletePengurus(null);
      refetchPengurus();
    } catch {
      showError("Gagal menghapus pengurus.", "Terjadi Kesalahan");
    } finally {
      setIsDeletingPengurus(false);
    }
  };

  const handleConfirmGenerateQueue = () => {
    if (!currentPeriodeId) return;
    setIsConfirmGenerateOpen(false);
    generateQueueMutation.mutate(currentPeriodeId, {
      onSuccess: (res: any) => {
        const msg =
          res.addedCount > 0 ? `+${res.addedCount} baru` : "Sudah sinkron";
        showSuccess(`Smart Sync Selesai! (${msg})`, "Rekonsiliasi Berhasil");
        refetchQueue();
      },
      onError: (err) => showError(err.message, "Gagal Sync Antrean"),
    });
  };

  const handleOpenGenerateQueue = () => {
    if (!currentPeriodeId) {
      showError(
        "Gagal memproses! Tidak ada periode yang sedang aktif atau ditinjau. Silakan buat atau pilih periode terlebih dahulu.",
        "Periode Tidak Ditemukan",
      );
      return;
    }
    setIsConfirmGenerateOpen(true);
  };

  return {
    isAdmin,
    currentUser,
    activeTab,
    setActiveTab,
    page,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    pengurusSearch,
    setPengurusSearch,
    pengurusDaerahFilter,
    setPengurusDaerahFilter,
    auditSearch,
    setAuditSearch,
    auditDateFilter,
    setAuditDateFilter,
    activePeriode,
    selectedPeriode,
    setSelectedPeriode,
    currentPeriodeId,
    periodeList,
    isPeriodeListLoading,
    stats,
    isStatsLoading,
    daerahOptions,
    filteredPengurusData,
    isPengurusLoading,
    paginatedQueueItems,
    isQueueLoading,
    totalItems,
    totalPages,
    PER_PAGE,
    filteredAuditItems,
    isHistoryLoading,
    availableHijriDateOptions,
    // Modal states & triggers
    isPosOpen,
    setIsPosOpen,
    isImportPengurusOpen,
    setIsImportPengurusOpen,
    isCreatePeriodeOpen,
    setIsCreatePeriodeOpen,
    isManagePeriodeOpen,
    setIsManagePeriodeOpen,
    isManagePengurusOpen,
    setIsManagePengurusOpen,
    selectedExecuteItem,
    setSelectedExecuteItem,
    selectedDispensasiItem,
    setSelectedDispensasiItem,
    isConfirmGenerateOpen,
    setIsConfirmGenerateOpen,
    selectedDeletePengurus,
    setSelectedDeletePengurus,
    isDeletingPengurus,
    // Action Callbacks
    refetchAll: () => {
      refetchQueue();
      refetchPengurus();
    },
    handleCreatePeriode,
    handleUpdateStatusPeriode,
    handleDeletePeriode,
    handleConfirmSetor,
    handleConfirmDispensasi,
    handleConfirmDeletePengurus,
    handleConfirmGenerateQueue,
    handleOpenGenerateQueue,

    isCreatePending: createPeriodeMutation.isPending,
    isUpdateStatusPending: updateStatusPeriodeMutation.isPending,
    isDeletePeriodePending: deletePeriodeMutation.isPending,
    isExecutePending: executeSetorMutation.isPending,
    isDispensasiPending: dispensasiMutation.isPending,
    isGeneratePending: generateQueueMutation.isPending,
  };
}
