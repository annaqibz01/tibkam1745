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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none font-sans">
      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-gray-400 shadow-inner mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-gray-200">{title}</h3>
      {description && (
        <p className="text-xs font-mono text-gray-500 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};