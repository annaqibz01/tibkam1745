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
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const GlassDropdown: React.FC<GlassDropdownProps> = ({
  value,
  onChange,
  options,
  defaultLabel,
  icon,
  activeColorClass = "border-zinc-700 text-zinc-100",
  minWidthClass = "min-w-[180px]",
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
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
    }
  }, [isOpen, searchable]);

  const isDefaultSelected =
    value === "all" || value === "Semua Status" || value === "Semua Role";

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = isDefaultSelected
    ? defaultLabel
    : selectedOption?.label || value;

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
    <div ref={dropdownRef} className={`relative ${minWidthClass} select-none font-sans`}>
      {/* Trigger Button (Tinggi h-9 / 36px, Radius rounded-lg) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 flex items-center justify-between px-3 bg-zinc-900 border rounded-lg text-xs font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen || !isDefaultSelected
            ? `${activeColorClass} border-zinc-700 bg-zinc-800/80`
            : "border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {icon}
          <span className="truncate">{selectedLabel}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 shrink-0 ml-1.5 ${
            isOpen ? "rotate-180 text-zinc-200" : ""
          }`}
        />
      </button>

      {/* Popover Menu Dropdown */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 z-40 mt-1 w-full min-w-[200px] max-h-60 overflow-hidden bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-1 flex flex-col space-y-1 font-sans text-xs"
          >
            {/* Search Box Internal */}
            {searchable && options.length > 3 && (
              <div className="relative shrink-0 px-1 pt-1 pb-0.5">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-7 pl-7 pr-6 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-100 text-[11px] placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {internalSearch && (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setInternalSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* List Pilihan */}
            <div className="overflow-y-auto max-h-48 space-y-0.5 custom-scrollbar pr-0.5 flex-1">
              <button
                type="button"
                onClick={() => {
                  const defaultValue =
                    options[0]?.value === "all" ? "all" : options[0]?.value || "all";
                  onChange(defaultValue);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  isDefaultSelected
                    ? "bg-zinc-800 text-white font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
                }`}
              >
                <span className="truncate">{defaultLabel}</span>
                {isDefaultSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
              </button>

              {filteredOptions.length === 0 ? (
                <div className="py-3 text-center text-[11px] text-zinc-500 font-sans">
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
                      className={`w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                        isSelected
                          ? "bg-zinc-800 text-white font-semibold"
                          : "text-zinc-300 hover:bg-zinc-800/60 hover:text-white"
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