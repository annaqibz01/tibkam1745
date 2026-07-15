// src/hooks/useWaktuIstiwa.ts
import { useState, useEffect } from 'react';
import { dapatkanDetailWis, DetailWis } from '../utils/waktuIstiwa';

export const useWaktuIstiwa = () => {
  const [waktuWis, setWaktuWis] = useState<DetailWis>(dapatkanDetailWis());

  useEffect(() => {
    // Kita percepat intervalnya jadi 100ms (10x lipat lebih sensitif)
    const interval = setInterval(() => {
      const waktuBaru = dapatkanDetailWis();
      
      // OPTIMASI: Gembok pintar agar React TIDAK re-render 10x per detik
      setWaktuWis((waktuLama) => {
        // Jika teks jam-nya masih sama persis (detiknya belum ganti), batalkan update!
        if (waktuLama.stringLengkap === waktuBaru.stringLengkap) {
          return waktuLama; 
        }
        // Jika angkanya beda (detik ganti), baru suruh React perbarui layar
        return waktuBaru; 
      });
      
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return waktuWis;
};