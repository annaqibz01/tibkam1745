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
  /** Unique layout ID per halaman agar animasi slide Framer Motion bekerja presisi */
  layoutId: string;
  activeColorClass?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  activeColorClass = "bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400/30",
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex items-center gap-1 h-12 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 p-1 rounded-2xl shadow-lg select-none ${className}`.trim()}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative h-full px-3.5 rounded-xl text-xs font-mono font-bold transition-colors duration-200 flex items-center justify-center gap-2 active:scale-95 ${
              isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={`absolute inset-0 rounded-xl shadow-md border ${activeColorClass}`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
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