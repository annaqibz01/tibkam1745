// src/features/laporan/utils/excel/generateChart.ts

/**
 * 📊 Generator Donut Chart Base64 PNG via HTML5 Canvas API (Tanpa Teks Bentrok)
 */
export const generateChartBase64 = (
  sudah: number,
  belum: number,
  dispensasi: number
): string => {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const total = sudah + belum + dispensasi;

    // Dimensi Canvas Wide Presisi A4
    const width = 560;
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    // Background & Frame Border
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    const items = [
      { label: "Sudah Setor", value: sudah, color: "#16A34A", bg: "#DCFCE7" },
      { label: "Belum Setor", value: belum, color: "#DC2626", bg: "#FEE2E2" },
      { label: "Dispensasi Khusus", value: dispensasi, color: "#D97706", bg: "#FEF3C7" },
    ];

    // Geometri Donut Chart
    const cx = 115;
    const cy = 90;
    const outerRadius = 62;
    const innerRadius = 36;

    let startAngle = -Math.PI / 2;

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#E2E8F0";
      ctx.fill();
    } else {
      items.forEach((item) => {
        if (item.value <= 0) return;
        const sliceAngle = (item.value / total) * (Math.PI * 2);
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(cx, cy, outerRadius, startAngle, endAngle);
        ctx.arc(cx, cy, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();

        startAngle = endAngle;
      });
    }

    // Donut Hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Teks Tengah Donut
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 14px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#0F172A";
    ctx.fillText(total.toLocaleString("id-ID"), cx, cy - 6);

    ctx.font = "8px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText("TOTAL SANTRI", cx, cy + 8);

    // Judul Legenda
    const lx = 240;
    ctx.textAlign = "left";
    ctx.font = "bold 10.5px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#1B4D3E";
    ctx.fillText("DISTRIBUSI STATUS SETOR RAMBUT", lx, 22);

    // Garis Pemisah
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx, 28);
    ctx.lineTo(width - 20, 28);
    ctx.stroke();

    // Stat Box 2-Baris (Mencegah Overlap Teks)
    let ly = 38;
    items.forEach((item) => {
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) + "%" : "0.0%";
      const boxWidth = width - lx - 20;
      const boxHeight = 40;

      // Stat Box Fill & Border
      ctx.fillStyle = item.bg;
      ctx.fillRect(lx, ly, boxWidth, boxHeight);
      ctx.strokeStyle = item.color + "50";
      ctx.strokeRect(lx, ly, boxWidth, boxHeight);

      // Color Badge Indicator
      ctx.fillStyle = item.color;
      ctx.fillRect(lx + 8, ly + 8, 10, 24);

      // Baris 1: Label Nama Status
      ctx.font = "bold 10px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#1E293B";
      ctx.fillText(item.label, lx + 26, ly + 15);

      // Baris 2: Nilai & Persentase
      ctx.font = "bold 11px 'Segoe UI', monospace";
      ctx.fillStyle = item.color;
      ctx.fillText(`${item.value.toLocaleString("id-ID")} Santri (${pct})`, lx + 26, ly + 30);

      ly += 45;
    });

    return canvas.toDataURL("image/png");
  } catch (err) {
    return "";
  }
};