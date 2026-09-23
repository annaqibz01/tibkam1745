import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import { useToast } from "@/context/ToastContext";
import {
  useCreatePeriode,
  useUpdateStatusPeriode,
  useDeletePeriode,
} from "../api/usePeriodeRambut";
import { useGenerateWajibSetor } from "../api/useQueueRambut";
import { useExecuteSetorRambut, useDispensasiRambut } from "../api/useTransaksiRambut";
import type { WajibSetorExpanded, CreatePeriodePayload } from "../../types";
import type { PengurusItem } from "../../components/RambutQueueTable";
import type {
  PeriodeRambutResponse,
  PeriodeRambutStatusPeriodeOptions,
} from "@/types/pocketbase-types";

export type RambutModalType =
  | "CREATE_PERIODE"
  | "MANAGE_PERIODE"
  | "MANAGE_PENGURUS"
  | "POS"
  | "IMPORT_PENGURUS"
  | "CONFIRM_GENERATE";

interface UseRambutModalsProps {
  currentPeriodeId?: string;
  hasQueue: boolean;
  selectedPeriode: PeriodeRambutResponse | null;
  setSelectedPeriode: (p: PeriodeRambutResponse | null) => void;
  refetchQueue: () => void;
  refetchPengurus: () => void;
}

export function useRambutModals({
  currentPeriodeId,
  hasQueue,
  selectedPeriode,
  setSelectedPeriode,
  refetchQueue,
  refetchPengurus,
}: UseRambutModalsProps) {
  const { showSuccess, showError } = useToast();

  const [activeModal, setActiveModal] = useState<RambutModalType | null>(null);
  const [selectedExecuteItem, setSelectedExecuteItem] = useState<WajibSetorExpanded | null>(null);
  const [selectedDispensasiItem, setSelectedDispensasiItem] = useState<WajibSetorExpanded | null>(null);
  const [selectedDeletePengurus, setSelectedDeletePengurus] = useState<PengurusItem | null>(null);
  const [isDeletingPengurus, setIsDeletingPengurus] = useState(false);

  const createPeriodeMutation = useCreatePeriode();
  const updateStatusPeriodeMutation = useUpdateStatusPeriode();
  const deletePeriodeMutation = useDeletePeriode();
  const generateQueueMutation = useGenerateWajibSetor();
  const executeSetorMutation = useExecuteSetorRambut();
  const dispensasiMutation = useDispensasiRambut();

  const handleCreatePeriode = (payload: CreatePeriodePayload) => {
    createPeriodeMutation.mutate(payload, {
      onSuccess: () => {
        showSuccess(`Periode ${payload.nama_periode} berhasil dibuat!`, "Periode Baru");
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
        onSuccess: () => {
          showSuccess(`Status periode diubah ke ${status.toUpperCase()}`, "Status Diperbarui");
        },
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
        santriId: selectedExecuteItem.santri || selectedExecuteItem.expand?.santri?.id || "",
        id_pps: selectedExecuteItem.id_pps,
        periodeId: currentPeriodeId,
        catatan,
      },
      {
        onSuccess: () => {
          showSuccess(`Setor ID PPS ${selectedExecuteItem.id_pps} berhasil!`, "Verifikasi Sukses");
          setSelectedExecuteItem(null);
        },
        onError: (err) => showError(err.message, "Gagal Verifikasi"),
      },
    );
  };

  const handleConfirmDispensasi = (catatan: string) => {
    if (!selectedDispensasiItem || !currentPeriodeId) return;
    dispensasiMutation.mutate(
      {
        wajibSetorId: selectedDispensasiItem.id,
        santriId: selectedDispensasiItem.santri || selectedDispensasiItem.expand?.santri?.id || "",
        id_pps: selectedDispensasiItem.id_pps,
        periodeId: currentPeriodeId,
        catatan,
      },
      {
        onSuccess: () => {
          showSuccess(`Dispensasi ID PPS ${selectedDispensasiItem.id_pps} disimpan!`, "Dispensasi Disimpan");
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
      showSuccess(`Pengurus ID PPS ${selectedDeletePengurus.id_pps} dihapus.`, "Berhasil Hapus");
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
    setActiveModal(null);

    generateQueueMutation.mutate(currentPeriodeId, {
      onSuccess: (res: any) => {
        const addedCount = res?.addedCount ?? 0;
        if (hasQueue) {
          const msg = addedCount > 0 ? `+${addedCount} data baru` : "Sudah sinkron";
          showSuccess(`Smart Sync Selesai! (${msg})`, "Rekonsiliasi Berhasil");
        } else {
          showSuccess(`Berhasil generate antrean awal! (${addedCount} santri & pengurus terdaftar)`, "Generate Antrean Berhasil");
        }
        refetchQueue();
      },
      onError: (err) => showError(err.message, hasQueue ? "Gagal Sync Antrean" : "Gagal Generate Antrean"),
    });
  };

  const handleOpenGenerateQueue = () => {
    if (!currentPeriodeId) {
      showError("Gagal memproses! Tidak ada periode yang sedang aktif atau ditinjau.", "Periode Tidak Ditemukan");
      return;
    }
    setActiveModal("CONFIRM_GENERATE");
  };

  return {
    activeModal,
    setActiveModal,
    selectedExecuteItem,
    setSelectedExecuteItem,
    selectedDispensasiItem,
    setSelectedDispensasiItem,
    selectedDeletePengurus,
    setSelectedDeletePengurus,
    isDeletingPengurus,
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