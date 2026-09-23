import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import { parseNumericIdPps } from "@/utils/userHelpers";
import type { PengurusItem } from "../../components/RambutQueueTable";

export function useRambutPengurusTab(perPage: number = 15) {
  const [pengurusPage, setPengurusPage] = useState(1);
  const [pengurusSearch, setPengurusSearch] = useState("");
  const [pengurusDaerahFilter, setPengurusDaerahFilter] = useState("all");

  useEffect(() => {
    setPengurusPage(1);
  }, [pengurusSearch, pengurusDaerahFilter]);

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
      const dom = p.expand?.santri?.domisili || p.expand?.santri?.status_domisili;
      if (dom) {
        const firstChar = dom.toString().trim().toUpperCase().charAt(0);
        if (firstChar >= "A" && firstChar <= "Z") set.add(firstChar);
      }
    });
    return Array.from(set).sort();
  }, [rawPengurusData]);

  const filteredPengurusData = useMemo(() => {
    const list = rawPengurusData.filter((p) => {
      const santriNama = p.expand?.santri?.nama || "";
      const matchSearch =
        !pengurusSearch ||
        p.id_pps.toLowerCase().includes(pengurusSearch.toLowerCase()) ||
        santriNama.toLowerCase().includes(pengurusSearch.toLowerCase()) ||
        p.jabatan.toLowerCase().includes(pengurusSearch.toLowerCase());

      const dom = p.expand?.santri?.domisili || p.expand?.santri?.status_domisili || "";
      const firstChar = dom.toString().trim().toUpperCase().charAt(0);
      const matchDaerah = pengurusDaerahFilter === "all" || firstChar === pengurusDaerahFilter;

      return matchSearch && matchDaerah;
    });

    return list.sort(
      (a, b) => parseNumericIdPps(a.id_pps) - parseNumericIdPps(b.id_pps)
    );
  }, [rawPengurusData, pengurusSearch, pengurusDaerahFilter]);

  const totalPengurusItems = filteredPengurusData.length;
  const totalPengurusPages = Math.ceil(totalPengurusItems / perPage);

  const paginatedPengurusItems = useMemo(() => {
    const start = (pengurusPage - 1) * perPage;
    return filteredPengurusData.slice(start, start + perPage);
  }, [filteredPengurusData, pengurusPage, perPage]);

  return {
    pengurusPage,
    setPengurusPage,
    pengurusSearch,
    setPengurusSearch,
    pengurusDaerahFilter,
    setPengurusDaerahFilter,
    daerahOptions,
    filteredPengurusData,
    paginatedPengurusItems,
    totalPengurusItems,
    totalPengurusPages,
    isPengurusLoading,
    refetchPengurus,
  };
}