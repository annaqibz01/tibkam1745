// src/components/shared/BaseToolbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Search, X, RefreshCw } from "lucide-react";

interface BaseToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  placeholder: string;
  onRefresh: () => void;
  isLoading: boolean;
  searchIconColorClass?: string;
  children?: React.ReactNode;
}

export const BaseToolbar: React.FC<BaseToolbarProps> = ({
  search,
  onSearchChange,
  placeholder,
  onRefresh,
  isLoading,
  searchIconColorClass = "text-zinc-500",
  children,
}) => {
  const [localSearch, setLocalSearch] = useState(search);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchChange(localSearch);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  };

  const handleClear = () => {
    setLocalSearch("");
    onSearchChange("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full select-none font-sans">
      {/* Search Input Universal (Tinggi Standar h-9 / 36px, Radius rounded-lg) */}
      <div className="relative flex-1 group min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
          <Search className={`w-4 h-4 ${searchIconColorClass}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-9 pl-9 pr-8 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 text-xs placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
        {localSearch && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Slot Filter Dinamis (Dropdown / Segmented Control) */}
      {children}

      {/* Refresh Button Universal (Kotak Presisi w-9 h-9, Radius rounded-lg) */}
      <button
        type="button"
        tabIndex={-1}
        onClick={onRefresh}
        disabled={isLoading}
        className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        title="Perbarui Data"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
      </button>
    </div>
  );
};