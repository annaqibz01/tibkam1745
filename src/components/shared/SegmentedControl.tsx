// src/components/shared/SegmentedControl.tsx
import React from "react";
import { motion } from "framer-motion";

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  activeColorClass?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  activeColorClass = "bg-zinc-800 text-white border-zinc-700",
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex items-center gap-0.5 h-9 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg select-none font-sans ${className}`.trim()}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative h-full px-3 rounded-md text-xs font-medium transition-colors duration-150 flex items-center justify-center gap-1.5 active:scale-98 ${
              isActive ? "text-white font-semibold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={`absolute inset-0 rounded-md border shadow-sm ${activeColorClass}`}
                transition={{ duration: 0.12, ease: "easeOut" }}
              />
            )}
            {option.icon && (
              <span className="relative z-10 shrink-0">{option.icon}</span>
            )}
            <span className="relative z-10 whitespace-nowrap">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}