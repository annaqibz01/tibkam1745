import React, { useState, useMemo, useEffect } from "react";
import { useRiwayatSetorList } from "../api/useTransaksiRambut";
import { toLocalYMD } from "@/utils/dateHelpers";
import { parseNumericIdPps } from "@/utils/userHelpers";
import { HijriText } from "@/components/shared/HijriText";

export function useRambutAuditTab(currentPeriodeId?: string, perPage: number = 15) {
  const [auditPage, setAuditPage] = useState(1);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditDateFilter, setAuditDateFilter] = useState("all");

  useEffect(() => {
    setAuditPage(1);
  }, [auditSearch, auditDateFilter]);

  const { data: historyData = [], isLoading: isHistoryLoading } = useRiwayatSetorList(currentPeriodeId);

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
    const list = historyData.filter((item: any) => {
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
      const matchDate = auditDateFilter === "all" || itemDateKey === auditDateFilter;

      return matchSearch && matchDate;
    });

    return list.sort(
      (a: any, b: any) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps)
    );
  }, [historyData, auditSearch, auditDateFilter]);

  const totalAuditItems = filteredAuditItems.length;
  const totalAuditPages = Math.ceil(totalAuditItems / perPage);

  const paginatedAuditItems = useMemo(() => {
    const start = (auditPage - 1) * perPage;
    return filteredAuditItems.slice(start, start + perPage);
  }, [filteredAuditItems, auditPage, perPage]);

  return {
    auditPage,
    setAuditPage,
    auditSearch,
    setAuditSearch,
    auditDateFilter,
    setAuditDateFilter,
    availableHijriDateOptions,
    filteredAuditItems,
    paginatedAuditItems,
    totalAuditItems,
    totalAuditPages,
    isHistoryLoading,
  };
}