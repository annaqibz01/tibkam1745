// src/features/rambut/hooks/useRambutPage.ts
import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/features/auth";
import { useToast } from "@/context/ToastContext";
import { HijriText } from "@/components/shared/HijriText";
import { isDateWithinRange, toLocalYMD } from "@/utils/dateHelpers";
import {
  useRambut,
  useRambutStats,
  parseNumericIdPps,
  type WajibSetorExpanded,
  type CreatePeriodePayload,
} from "./useRambut";
import type { PengurusItem } from "../components/RambutQueueTable";
import type { RambutTabType } from "../components/RambutScanToolbar";
import type {
  UsersResponse,
  PeriodeRambutResponse,
  PeriodeRambutStatusPeriodeOptions,
  WajibSetorRambutStatusSetorOptions,
} from "@/types/pocketbase-types";

const PER_PAGE = 15;

export type RambutModalType =
  | "CREATE_PERIODE"
  | "MANAGE_PERIODE"
  | "MANAGE_PENGURUS"
  | "POS"
  | "IMPORT_PENGURUS"
  | "CONFIRM_GENERATE";

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

  // Unified Modal Registry State
  const [activeModal, setActiveModal] = useState<RambutModalType | null>(null);

  // Data-Driven Modals
  const [selectedExecuteItem, setSelectedExecuteItem] =
    useState<WajibSetorExpanded | null>(null);
  const [selectedDispensasiItem, setSelectedDispensasiItem] =
    useState<WajibSetorExpanded | null>(null);
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
  const [pengurusPage, setPengurusPage] = useState(1);

  useEffect(() => {
    setPengurusPage(1);
  }, [pengurusSearch, pengurusDaerahFilter]);

  const [auditPage, setAuditPage] = useState(1);

  useEffect(() => {
    setAuditPage(1);
  }, [auditSearch, auditDateFilter]);

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

  // Hitung status aktif & tanggal operasional
  const targetPeriode = selectedPeriode || activePeriode;
  const isPeriodeAktif = targetPeriode?.status_periode === "aktif";
  const isWithinDateRange = targetPeriode
    ? isDateWithinRange(
        new Date(),
        targetPeriode.tanggal_mulai,
        targetPeriode.tanggal_selesai,
      )
    : false;

  // Admin selalu bisa eksekusi; Role 'rambut' harus memenuhi syarat tanggal & status aktif
  const canExecute =
    isAdmin ||
    (currentUser?.role === "rambut" && isPeriodeAktif && isWithinDateRange);

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
        const firstChar = dom.toString().trim().toUpperCase().charAt(0);
        if (firstChar && firstChar >= "A" && firstChar <= "Z")
          set.add(firstChar);
      }
    });
    return Array.from(set).sort();
  }, [rawPengurusData]);

  const filteredPengurusData = useMemo(() => {
    return rawPengurusData.filter((p) => {
      const santriNama = p.expand?.santri?.nama || "";
      const matchSearch =
        !pengurusSearch ||
        p.id_pps.toLowerCase().includes(pengurusSearch.toLowerCase()) ||
        santriNama.toLowerCase().includes(pengurusSearch.toLowerCase()) ||
        p.jabatan.toLowerCase().includes(pengurusSearch.toLowerCase());

      const dom =
        p.expand?.santri?.domisili || p.expand?.santri?.status_domisili || "";
      const firstChar = dom.toString().trim().toUpperCase().charAt(0);
      const matchDaerah =
        pengurusDaerahFilter === "all" || firstChar === pengurusDaerahFilter;

      return matchSearch && matchDaerah;
    });
  }, [rawPengurusData, pengurusSearch, pengurusDaerahFilter]);

  const totalPengurusItems = filteredPengurusData.length;
  const totalPengurusPages = Math.ceil(totalPengurusItems / PER_PAGE);

  const paginatedPengurusItems = useMemo(() => {
    const start = (pengurusPage - 1) * PER_PAGE;
    return filteredPengurusData.slice(start, start + PER_PAGE);
  }, [filteredPengurusData, pengurusPage]);

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

  // 🎯 FIX 1: FILTER TANGGAL AUDIT BERBASIS WAKTU LOKAL (Mencegah Shift Jam UTC)
  const availableHijriDateOptions = useMemo(() => {
    if (!historyData) return [];
    const map = new Map<string, string>();
    historyData.forEach((item: any) => {
      const dateKey = toLocalYMD(item.tanggal_setor || item.created);
      if (dateKey && !map.has(dateKey)) {
        map.set(dateKey, dateKey);
      }
    });
    return Array.from(map.keys()).map((dateStr) => ({
      value: dateStr,
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

      const itemDateKey = toLocalYMD(item.tanggal_setor || item.created);
      const matchDate =
        auditDateFilter === "all" || itemDateKey === auditDateFilter;

      return matchSearch && matchDate;
    });
  }, [historyData, auditSearch, auditDateFilter]);

  const totalAuditItems = filteredAuditItems.length;
  const totalAuditPages = Math.ceil(totalAuditItems / PER_PAGE);

  const paginatedAuditItems = useMemo(() => {
    const start = (auditPage - 1) * PER_PAGE;
    return filteredAuditItems.slice(start, start + PER_PAGE);
  }, [filteredAuditItems, auditPage]);

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
        setActiveModal(null);
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
        santriId:
          selectedExecuteItem.santri ||
          selectedExecuteItem.expand?.santri?.id ||
          "",
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

  // 🎯 FIX 2: SINKRONISASI PAYLOAD LENGKAP MUTASI DISPENSASI (Agar Tercatat di Audit Log)
  const handleConfirmDispensasi = (catatan: string) => {
    if (!selectedDispensasiItem || !currentPeriodeId) return;
    dispensasiMutation.mutate(
      {
        wajibSetorId: selectedDispensasiItem.id,
        santriId:
          selectedDispensasiItem.santri ||
          selectedDispensasiItem.expand?.santri?.id ||
          "",
        id_pps: selectedDispensasiItem.id_pps,
        periodeId: currentPeriodeId,
        catatan,
      },
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

    const hasExistingQueue = stats.total > 0;

    setActiveModal(null);
    generateQueueMutation.mutate(currentPeriodeId, {
      onSuccess: (res: any) => {
        const addedCount = res?.addedCount ?? 0;

        if (hasExistingQueue) {
          const msg =
            addedCount > 0 ? `+${addedCount} data baru` : "Sudah sinkron";
          showSuccess(`Smart Sync Selesai! (${msg})`, "Rekonsiliasi Berhasil");
        } else {
          showSuccess(
            `Berhasil generate antrean awal! (${addedCount} santri & pengurus terdaftar)`,
            "Generate Antrean Berhasil",
          );
        }

        refetchQueue();
      },
      onError: (err) =>
        showError(
          err.message,
          hasExistingQueue ? "Gagal Sync Antrean" : "Gagal Generate Antrean",
        ),
    });
  };

  const handleOpenGenerateQueue = () => {
    if (!currentPeriodeId) {
      showError(
        "Gagal memproses! Tidak ada periode yang sedang aktif atau ditinjau.",
        "Periode Tidak Ditemukan",
      );
      return;
    }
    setActiveModal("CONFIRM_GENERATE");
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
    // Unified Modal Registry State
    activeModal,
    setActiveModal,
    // Data-driven states
    selectedExecuteItem,
    setSelectedExecuteItem,
    selectedDispensasiItem,
    setSelectedDispensasiItem,
    selectedDeletePengurus,
    setSelectedDeletePengurus,
    isDeletingPengurus,
    pengurusPage,
    setPengurusPage,
    totalPengurusItems,
    totalPengurusPages,
    paginatedPengurusItems,
    auditPage,
    setAuditPage,
    totalAuditItems,
    totalAuditPages,
    paginatedAuditItems,
    // Callbacks
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
