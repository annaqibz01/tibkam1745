// src/components/shared/EmptyState.tsx
import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center select-none font-sans">
      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 mb-2.5">
        {icon}
      </div>
      <h3 className="text-xs font-semibold text-zinc-200">{title}</h3>
      {description && (
        <p className="text-[11px] text-zinc-500 max-w-sm mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
};