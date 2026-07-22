// src/hooks/useKalenderHijriyah.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import { parsePocketBaseError } from '@/utils/errorHandler';
import type { 
  KalenderHijriyahResponse, 
  KalenderHijriyahBulanHijriNamaOptions 
} from '@/types/pocketbase-types';

/**
 * 💡 HELPER ASYNC: Bisa dipanggil langsung di fungsi event handler / onClick (non-hook)
 */
export async function fetchHijriByDate(dateInput?: string | Date | null): Promise<KalenderHijriyahResponse | null> {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  try {
    return await pb.collection('kalender_hijriyah').getFirstListItem<KalenderHijriyahResponse>(
      `tanggal_masehi >= "${dateStr} 00:00:00" && tanggal_masehi <= "${dateStr} 23:59:59"`
    );
  } catch {
    return null;
  }
}

export function useTodayHijri() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  return useQuery<KalenderHijriyahResponse | null>({
    queryKey: ['kalender-hijriyah-today', todayStr],
    queryFn: async () => {
      try {
        return await pb.collection('kalender_hijriyah').getFirstListItem<KalenderHijriyahResponse>(
          `tanggal_masehi >= "${todayStr} 00:00:00" && tanggal_masehi <= "${todayStr} 23:59:59"`
        );
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}

export interface GenerateBulanPayload {
  bulan_angka: number;
  bulan_nama: KalenderHijriyahBulanHijriNamaOptions;
  tahun: number;
  tanggal_awal_masehi: string;
  tanggal_akhir_masehi: string;
}

export function useHijriByDate(dateInput?: string | Date | null) {
  const d = dateInput ? new Date(dateInput) : null;
  const validDate = d && !isNaN(d.getTime()) ? d : null;

  const dateStr = validDate
    ? `${validDate.getFullYear()}-${String(validDate.getMonth() + 1).padStart(2, '0')}-${String(validDate.getDate()).padStart(2, '0')}`
    : '';

  return useQuery<KalenderHijriyahResponse | null>({
    queryKey: ['kalender-hijriyah-by-date', dateStr],
    queryFn: () => fetchHijriByDate(validDate), // Menggunakan helper di atas
    enabled: !!dateStr,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useAdminKalender() {
  const queryClient = useQueryClient();

  const useKalenderList = (params: { page: number; perPage: number; tahun?: number; bulanAngka?: number }) => {
    return useQuery({
      queryKey: ['kalender-list', params.page, params.perPage, params.tahun, params.bulanAngka],
      queryFn: async () => {
        const filters: string[] = [];
        if (params.tahun) filters.push(`tahun_hijri = ${params.tahun}`);
        if (params.bulanAngka) filters.push(`bulan_hijri_angka = ${params.bulanAngka}`);

        return pb.collection('kalender_hijriyah').getList<KalenderHijriyahResponse>(
          params.page,
          params.perPage,
          {
            filter: filters.length > 0 ? filters.join(' && ') : '',
            sort: '-tanggal_masehi',
          }
        );
      },
      placeholderData: keepPreviousData,
    });
  };

  const useKalenderBulan = (tahun: number, bulanAngka: number) => {
    return useQuery<KalenderHijriyahResponse[]>({
      queryKey: ['kalender-bulan-full', tahun, bulanAngka],
      queryFn: async () => {
        if (!tahun || !bulanAngka) return [];
        return await pb.collection('kalender_hijriyah').getFullList<KalenderHijriyahResponse>({
          filter: `tahun_hijri = ${tahun} && bulan_hijri_angka = ${bulanAngka}`,
          sort: 'tanggal_hijri',
        });
      },
      enabled: !!tahun && !!bulanAngka,
    });
  };

  const useLatestKalender = () => {
    return useQuery<KalenderHijriyahResponse | null>({
      queryKey: ['latest-kalender-record'],
      queryFn: async () => {
        try {
          const list = await pb.collection('kalender_hijriyah').getList<KalenderHijriyahResponse>(1, 1, {
            sort: '-tanggal_masehi',
          });
          return list.items[0] || null;
        } catch {
          return null;
        }
      },
    });
  };

  const useGenerateBulan = () => {
    return useMutation({
      mutationFn: async (payload: GenerateBulanPayload) => {
        try {
          const checkExistMonth = await pb.collection('kalender_hijriyah').getList(1, 1, {
            filter: `bulan_hijri_angka = ${payload.bulan_angka} && tahun_hijri = ${payload.tahun}`,
          });

          if (checkExistMonth.totalItems > 0) {
            throw new Error(`Bulan ${payload.bulan_nama} ${payload.tahun} H sudah pernah dipetakan sebelumnya!`);
          }

          const checkOverlap = await pb.collection('kalender_hijriyah').getList(1, 1, {
            filter: `tanggal_masehi >= "${payload.tanggal_awal_masehi} 00:00:00" && tanggal_masehi <= "${payload.tanggal_akhir_masehi} 23:59:59"`,
          });

          if (checkOverlap.totalItems > 0) {
            const sample = checkOverlap.items[0] as KalenderHijriyahResponse;
            throw new Error(`Rentang Masehi yang Anda pilih bentrok dengan data terdaftar (${sample.string_hijri}).`);
          }

          const start = new Date(payload.tanggal_awal_masehi);
          const end = new Date(payload.tanggal_akhir_masehi);
          start.setHours(12, 0, 0, 0);
          end.setHours(12, 0, 0, 0);

          const diffTime = end.getTime() - start.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          if (diffDays !== 29 && diffDays !== 30) {
            throw new Error(`Jumlah hari terhitung ${diffDays} hari. Bulan Hijriyah wajib 29 atau 30 hari!`);
          }

          const batch = pb.createBatch();
          for (let i = 0; i < diffDays; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(currentDate.getDate() + i);

            const tglMasehiFormat = currentDate.toISOString();
            const tglHijriAngka = i + 1;
            const stringHijri = `${tglHijriAngka} ${payload.bulan_nama} ${payload.tahun} H`;

            batch.collection('kalender_hijriyah').create({
              tanggal_masehi: tglMasehiFormat,
              tanggal_hijri: tglHijriAngka,
              bulan_hijri_angka: payload.bulan_angka,
              bulan_hijri_nama: payload.bulan_nama,
              tahun_hijri: payload.tahun,
              string_hijri: stringHijri,
            });
          }

          await batch.send();
          return diffDays;
        } catch (error) {
          throw new Error(parsePocketBaseError(error));
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['kalender-list'] });
        queryClient.invalidateQueries({ queryKey: ['kalender-bulan-full'] });
        queryClient.invalidateQueries({ queryKey: ['kalender-hijriyah-today'] });
        queryClient.invalidateQueries({ queryKey: ['latest-kalender-record'] });
      },
    });
  };

  return { useKalenderList, useKalenderBulan, useLatestKalender, useGenerateBulan };
}