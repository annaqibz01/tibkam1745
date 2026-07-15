// src/utils/waktuIstiwa.ts

export interface DetailWis {
  stringLengkap: string;
  jamDanMenit: string;
  jam: string;
  menit: string;
  detik: string;
}

// Fungsi Helper Trigonometri
const deg2rad = (deg: number) => deg * (Math.PI / 180.0);
const rad2deg = (rad: number) => rad * (180.0 / Math.PI);

/**
 * Menghitung Waktu Istiwa' (WIS) menggunakan standar Astronomi Jean Meeus (NOAA/NASA)
 * Akurasi Equation of Time tingkat observatorium.
 */
export const dapatkanDetailWis = (waktuInput: Date = new Date()): DetailWis => {
  // 1. Julian Date (JD) - Hitungan waktu absolut astronomi
  const timeMs = waktuInput.getTime();
  const JD = (timeMs / 86400000.0) + 2440587.5;

  // 2. Julian Century (T) - Skala waktu acuan terhadap Epoch J2000.0
  const T = (JD - 2451545.0) / 36525.0;

  // 3. Geometric Mean Longitude of Sun (L0)
  let L0 = 280.46646 + T * (36000.76983 + T * 0.0003032);
  L0 = L0 % 360.0; // Batasi 0 - 360 derajat

  // 4. Geometric Mean Anomaly of Sun (M)
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);

  // 5. Eccentricity of Earth Orbit (eOrbit) - Fluktuasi lonjong bumi
  const eOrbit = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

  // 6. Mean Obliquity of Ecliptic & Oblique Correction (Kemiringan Aksis Bumi)
  const epsilon0 = 23.0 + (26.0 + ((21.448 - T * (46.815 + T * (0.00059 - T * 0.001813)))) / 60.0) / 60.0;
  const omega = 125.04 - 1934.136 * T;
  const epsilon = epsilon0 + 0.00256 * Math.cos(deg2rad(omega));

  // 7. Variabel Y pembantu
  const y = Math.tan(deg2rad(epsilon) / 2.0) * Math.tan(deg2rad(epsilon) / 2.0);

  // 8. Equation of Time (EoT) dalam Radian (Rumus Utama NOAA)
  const EoT_rad = 
    y * Math.sin(2.0 * deg2rad(L0)) -
    2.0 * eOrbit * Math.sin(deg2rad(M)) +
    4.0 * eOrbit * y * Math.sin(deg2rad(M)) * Math.cos(2.0 * deg2rad(L0)) -
    0.5 * y * y * Math.sin(4.0 * deg2rad(L0)) -
    1.25 * eOrbit * eOrbit * Math.sin(2.0 * deg2rad(M));

  // Konversi Equation of Time (EoT) ke satuan Menit Waktu
  const e = rad2deg(EoT_rad) * 4.0;

  // 9. Presisi Maksimal Koordinat Masjid Jami' Sidogiri
  // Lintang: 112°50'09.38" E -> Dikonversi ke desimal = 112.8359388° E
  // WIB: 105° E. Selisih Bujur = 7.8359388°. Dikalikan 4 menit per derajat.
  const kwdSidogiri = 31.3437555;

  // TEMPAT KALIBRASI DETIK
  // Saya set 0 dulu agar kamu bisa mengecek keampuhan rumus NASA ini
  const offsetDetikPondok = 20; 

  // 10. Konversi total pergeseran ke Milidetik
  const totalPergeseranMenit = e + kwdSidogiri;
  const totalPergeseranMilidetik = (totalPergeseranMenit * 60 * 1000) + (offsetDetikPondok * 1000);
  
  // 11. Kalkulasi hasil akhir
  const waktuWis = new Date(waktuInput.getTime() + totalPergeseranMilidetik);

  const jam = String(waktuWis.getHours()).padStart(2, '0');
  const menit = String(waktuWis.getMinutes()).padStart(2, '0');
  const detik = String(waktuWis.getSeconds()).padStart(2, '0');

  return {
    stringLengkap: `${jam}:${menit}:${detik} WIS`,
    jamDanMenit: `${jam}:${menit} WIS`,
    jam,
    menit,
    detik
  };
};