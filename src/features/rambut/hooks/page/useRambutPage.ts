import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth";
import { isDateWithinRange } from "@/utils/dateHelpers";
import { useActivePeriode, usePeriodeList } from "../api/usePeriodeRambut";
import { useRambutStats } from "../api/useQueueRambut";
import { useRambutQueueTab } from "./useRambutQueueTab";
import { useRambutPengurusTab } from "./useRambutPengurusTab";
import { useRambutAuditTab } from "./useRambutAuditTab";
import { useRambutModals } from "./useRambutModals";
import type { RambutTabType } from "../../components/RambutScanToolbar";
import type { UsersResponse, PeriodeRambutResponse } from "@/types/pocketbase-types";

const PER_PAGE = 15;

export function useRambutPage() {
  const { user } = useAuth();
  const currentUser = user as UsersResponse | null;

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "admin_rambut";
  const [activeTab, setActiveTab] = useState<RambutTabType>("queue");
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeRambutResponse | null>(null);

  const { data: activePeriode } = useActivePeriode();
  const { data: periodeList = [], isLoading: isPeriodeListLoading } = usePeriodeList();

  useEffect(() => {
    if (activePeriode && !selectedPeriode) {
      setSelectedPeriode(activePeriode);
    }
  }, [activePeriode, selectedPeriode]);

  const currentPeriodeId = selectedPeriode?.id || activePeriode?.id;

  const targetPeriode = selectedPeriode || activePeriode;
  const isPeriodeAktif = targetPeriode?.status_periode === "aktif";
  const isWithinDateRange = targetPeriode
    ? isDateWithinRange(new Date(), targetPeriode.tanggal_mulai, targetPeriode.tanggal_selesai)
    : false;

  const canExecute = isAdmin || (currentUser?.role === "rambut" && isPeriodeAktif && isWithinDateRange);

  const queueTab = useRambutQueueTab(currentPeriodeId, PER_PAGE);
  const pengurusTab = useRambutPengurusTab(PER_PAGE);
  const auditTab = useRambutAuditTab(currentPeriodeId, PER_PAGE);

  const { data: statsData, isLoading: isStatsLoading } = useRambutStats(currentPeriodeId);
  const stats = statsData ?? { total: 0, sudah: 0, belum: 0, dispensasi: 0 };

  const refetchAll = () => {
    queueTab.refetchQueue();
    pengurusTab.refetchPengurus();
  };

  const modals = useRambutModals({
    currentPeriodeId,
    hasQueue: stats.total > 0,
    selectedPeriode,
    setSelectedPeriode,
    refetchQueue: queueTab.refetchQueue,
    refetchPengurus: pengurusTab.refetchPengurus,
  });

  return {
    isAdmin,
    canExecute,
    currentUser,
    activeTab,
    setActiveTab,
    activePeriode,
    selectedPeriode,
    setSelectedPeriode,
    currentPeriodeId,
    periodeList,
    isPeriodeListLoading,
    stats,
    isStatsLoading,
    PER_PAGE,
    refetchAll,
    ...queueTab,
    ...pengurusTab,
    ...auditTab,
    ...modals,
  };
}