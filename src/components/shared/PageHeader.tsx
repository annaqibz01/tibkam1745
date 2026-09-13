// src/components/shared/PageHeader.tsx
import React from "react";

export interface PageHeaderProps {
  badgeIcon?: React.ReactNode;
  badgeLabel?: string;
  statusBadge?: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
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
      className={`rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-sm select-none font-sans ${className}`.trim()}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Sisi Kiri: Badges, Title & Description */}
        <div className="space-y-2 min-w-0">
          {(badgeLabel || statusBadge) && (
            <div className="flex flex-wrap items-center gap-2">
              {badgeLabel && (
                <div className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2 py-0.5 font-sans text-[11px] font-medium text-zinc-300 border border-zinc-700/80">
                  {badgeIcon}
                  <span>{badgeLabel}</span>
                </div>
              )}
              {statusBadge}
            </div>
          )}

          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {title}
          </h1>

          {description && (
            <p className="max-w-2xl text-xs text-zinc-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Sisi Kanan: Actions & Widgets */}
        {(actions || widget) && (
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
            {actions}
            {widget}
          </div>
        )}
      </div>
    </div>
  );
};