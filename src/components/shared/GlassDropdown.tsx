// src/components/shared/GlassDropdown.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: React.ReactNode;
}

interface GlassDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  defaultLabel: string;
  icon?: React.ReactNode;
  activeColorClass?: string;
  minWidthClass?: string;
  disabled?: boolean;
  /** Aktifkan pencarian internal di dalam dropdown (Default: true jika opsi > 3) */
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const GlassDropdown: React.FC<GlassDropdownProps> = ({
  value,
  onChange,
  options,
  defaultLabel,
  icon,
  activeColorClass = "border-indigo-500/60 text-indigo-200 ring-indigo-500/20",
  minWidthClass = "min-w-[190px]",
  disabled = false,
  searchable = true,
  searchPlaceholder = "Cari opsi...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setInternalSearch("");
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, searchable]);

  const isDefaultSelected =
    value === "all" || value === "Semua Status" || value === "Semua Role";

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = isDefaultSelected
    ? defaultLabel
    : selectedOption?.label || value;

  // Filter opsi berdasarkan input pencarian internal
  const filteredOptions = useMemo(() => {
    if (!internalSearch.trim()) return options;
    const query = internalSearch.trim().toLowerCase();
    return options.filter((opt) => {
      if (typeof opt.label === "string") {
        return (
          opt.label.toLowerCase().includes(query) ||
          opt.value.toLowerCase().includes(query)
        );
      }
      return opt.value.toLowerCase().includes(query);
    });
  }, [options, internalSearch]);

  return (
    <div ref={dropdownRef} className={`relative ${minWidthClass} select-none`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 flex items-center justify-between px-4 bg-gray-900/80 backdrop-blur-xl border rounded-2xl text-xs font-mono font-bold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen || !isDefaultSelected
            ? `${activeColorClass} ring-2`
            : "border-gray-800/80 text-gray-300 hover:border-gray-700"
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {icon}
          <span className="truncate">{selectedLabel}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-full min-w-[220px] max-h-64 overflow-hidden bg-gray-900/98 backdrop-blur-2xl border border-gray-800 rounded-2xl shadow-2xl p-2 flex flex-col space-y-2 font-mono text-xs"
          >
            {/* 🔍 INTERNAL SEARCH BOX (Tampil jika opsi > 3) */}
            {searchable && options.length > 3 && (
              <div className="relative shrink-0">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-8 pl-8 pr-7 bg-gray-950/80 border border-gray-800 rounded-xl text-white text-[11px] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {internalSearch && (
                  <button
                    type="button"
                    onClick={() => setInternalSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* 📊 OPTIONS LIST */}
            <div className="overflow-y-auto max-h-48 space-y-0.5 custom-scrollbar pr-0.5 flex-1">
              <button
                type="button"
                onClick={() => {
                  const defaultValue =
                    options[0]?.value === "all" ? "all" : options[0]?.value || "all";
                  onChange(defaultValue);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                  isDefaultSelected
                    ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30"
                    : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                <span className="truncate">{defaultLabel}</span>
                {isDefaultSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </button>

              {filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-[10px] text-gray-500 font-sans">
                  Opsi tidak ditemukan
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  if (opt.value === "all" || opt.label === defaultLabel) return null;
                  const isSelected = value === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30"
                          : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};