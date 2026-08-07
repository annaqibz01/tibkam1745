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
  searchIconColorClass = "text-indigo-400",
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full select-none">
      {/* Search Input Universal (Height h-12) */}
      <div className="relative flex-1 group min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 transition-colors">
          <Search className={`w-4 h-4 sm:w-5 sm:h-5 ${searchIconColorClass}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-10 bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl text-white text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-lg font-mono transition-all duration-200"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Slot Filter Dinamis (GlassDropdown / SegmentedControl) */}
      {children}

      {/* Refresh Button Universal (Height h-12) */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="w-12 h-12 flex items-center justify-center flex-shrink-0 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 text-gray-300 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Perbarui Data"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
};