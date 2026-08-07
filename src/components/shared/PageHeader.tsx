// src/components/shared/PageHeader.tsx
import React from "react";

export interface PageHeaderProps {
  /** Ikon untuk badge kategori utama */
  badgeIcon?: React.ReactNode;
  /** Label untuk badge kategori utama */
  badgeLabel?: string;
  /** Badge status sekunder opsional (misal: Status Periode / Akses) */
  statusBadge?: React.ReactNode;
  /** Judul utama halaman (mendukung string atau elemen dengan gradient text) */
  title: React.ReactNode;
  /** Deskripsi singkat modul */
  description?: string;
  /** Slot tombol aksi utama di kanan atas */
  actions?: React.ReactNode;
  /** Slot widget khusus di kanan atas (misal: Live Clock Waktu Istiwa') */
  widget?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badgeIcon,
  badgeLabel,
  statusBadge,
  title,
  description,
  actions,
  widget,
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-r from-gray-900/90 via-indigo-950/40 to-gray-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl select-none ${className}`.trim()}
    >
      {/* 🔮 Ambient Glow Mesh Background */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Sisi Kiri: Badges, Title & Description */}
        <div className="space-y-3">
          {(badgeLabel || statusBadge) && (
            <div className="flex flex-wrap items-center gap-2.5">
              {badgeLabel && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-indigo-400 border border-indigo-500/20 shadow-sm uppercase tracking-wider">
                  {badgeIcon}
                  <span>{badgeLabel}</span>
                </div>
              )}
              {statusBadge}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h1>

          {description && (
            <p className="max-w-xl text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>

        {/* Sisi Kanan: Actions & Widgets */}
        {(actions || widget) && (
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center flex-shrink-0">
            {actions}
            {widget}
          </div>
        )}
      </div>
    </div>
  );
};