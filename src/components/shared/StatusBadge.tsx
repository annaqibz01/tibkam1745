// src/components/shared/StatusBadge.tsx
import React from "react";

export type BadgeVariant =
  | "success"  // Hijau: Aktif, Sudah Setor, Valid, Terverifikasi
  | "warning"  // Amber: Belum Setor, Pending, Draft
  | "danger"   // Rose: Nonaktif, Eror, Purna, Terkunci
  | "info"     // Indigo: Admin, Operator, Informasi
  | "purple"   // Purple: Dispensasi, Jabatan Khusus
  | "neutral"; // Gray: Default, Umum, Strip

export interface StatusBadgeProps {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = "neutral",
  icon,
  dot = false,
  children,
  className = "",
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    neutral: "bg-gray-800/80 text-gray-400 border-gray-700/80",
  };

  const dotStyles: Record<BadgeVariant, string> = {
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-indigo-400",
    purple: "bg-purple-400",
    neutral: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border shadow-sm select-none ${variantStyles[variant]} ${className}`.trim()}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]} animate-pulse shrink-0`}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};