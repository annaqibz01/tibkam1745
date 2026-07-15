// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { pb } from '../services/pocketbase';
import { SantriStatsData } from '../components/dashboard/shared/SantriStatsSummary';

export function useDashboardSantriStats() {
  return useQuery<any[], Error, SantriStatsData>({
    queryKey: ['dashboard-santri-stats'],
    queryFn: async () => {
      return await pb.collection('master').getFullList({
        fields: 'status_aktif,tingkatan,status_domisili,domisili',
      });
    },
    staleTime: 1000 * 60 * 5, // Gembok cache selama 5 menit
    // 🔥 KUNCI SEHAT: Transformasi data masal dieksekusi sekali di level network cache
    select: (santriList) => {
      let totalSantriAktif = 0;
      let totalPps = 0;
      let totalLpps = 0;
      const tingkatanCounts: Record<string, number> = {};
      const domisiliCounts: Record<string, number> = {};

      santriList.forEach((item) => {
        // 🚫 Abaikan santri non-aktif sejak awal
        if (!item.status_aktif) return;

        totalSantriAktif++;

        const statusDomisili = (item.status_domisili || '').toString().trim().toUpperCase();
        const domisiliVal = (item.domisili || '').toString().trim().toUpperCase();
        const firstChar = domisiliVal.charAt(0);

        // 1. DOMISILI PPS (A-T & Z)
        if (statusDomisili === 'PPS') {
          const isATorZ = (firstChar >= 'A' && firstChar <= 'T') || firstChar === 'Z';
          const isNotDKSK = !domisiliVal.startsWith('DKS') && !domisiliVal.includes('DKS-K');

          if (isATorZ && isNotDKSK) {
            totalPps++;
            // Kelompokkan berdasarkan huruf Kompleks saja
            const namaKompleks = `Daerah ${firstChar}`;
            domisiliCounts[namaKompleks] = (domisiliCounts[namaKompleks] || 0) + 1;
          }
        } 
        // 2. DOMISILI LPPS
        else if (statusDomisili === 'LPPS') {
          totalLpps++;
        }

        // 3. SEBARAN TINGKATAN (Gabungkan Idadiyah resmi)
        let rawTingkatan = item.tingkatan?.toString().trim() || 'Lainnya';
        let normTingkatan = rawTingkatan;

        const lowerTingkatan = rawTingkatan.toLowerCase();
        if (
          lowerTingkatan.includes('idadiyah') || 
          lowerTingkatan.includes('almiftah') || 
          lowerTingkatan.includes('al-miftah')
        ) {
          normTingkatan = 'Idadiyah';
        }

        if (normTingkatan && normTingkatan !== '-') {
          tingkatanCounts[normTingkatan] = (tingkatanCounts[normTingkatan] || 0) + 1;
        }
      });

      return {
        totalSantriAktif,
        totalPps,
        totalLpps,
        tingkatanCounts,
        domisiliCounts,
      };
    }
  });
}