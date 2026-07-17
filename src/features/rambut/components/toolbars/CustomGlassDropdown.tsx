// src/components/rambut/toolbars/CustomGlassDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: React.ReactNode;
}

interface CustomGlassDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  defaultLabel: string;
  icon: React.ReactNode;
  activeColorClass?: string; // Tipe warna aktif (purple untuk pengurus, amber untuk audit)
  minWidthClass?: string;
}

export const CustomGlassDropdown: React.FC<CustomGlassDropdownProps> = ({
  value,
  onChange,
  options,
  defaultLabel,
  icon,
  activeColorClass = "border-purple-500/60 text-purple-200 ring-purple-500/20",
  minWidthClass = "min-w-[200px]",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    value === "all"
      ? defaultLabel
      : options.find((opt) => opt.value === value)?.label || value;

  const isActive = value !== "all";

  return (
    <div ref={dropdownRef} className={`relative ${minWidthClass}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-xl border rounded-2xl text-xs font-mono font-bold transition-all duration-200 shadow-lg ${
          isOpen || isActive
            ? `${activeColorClass} ring-2`
            : "border-gray-800/80 text-gray-300 hover:border-gray-700"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon}
          <span className="truncate">{selectedLabel}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-full max-h-56 overflow-y-auto bg-gray-900/98 backdrop-blur-2xl border border-gray-800 rounded-2xl shadow-2xl p-1.5 space-y-0.5 custom-scrollbar"
          >
            <button
              type="button"
              onClick={() => {
                onChange("all");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition-colors ${
                value === "all"
                  ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30"
                  : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
              }`}
            >
              <span>{defaultLabel}</span>
              {value === "all" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-mono transition-colors ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30"
                      : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};