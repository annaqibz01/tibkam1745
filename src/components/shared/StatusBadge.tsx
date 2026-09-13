// src/components/shared/StatusBadge.tsx
import React from "react";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "neutral";

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
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    neutral: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };

  const dotStyles: Record<BadgeVariant, string> = {
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-indigo-400",
    purple: "bg-purple-400",
    neutral: "bg-zinc-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-sans text-[10px] font-medium border shadow-sm select-none ${variantStyles[variant]} ${className}`.trim()}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]} shrink-0`}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};