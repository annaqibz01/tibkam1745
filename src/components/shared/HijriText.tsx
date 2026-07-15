// src/components/shared/HijriText.tsx
import React from 'react';
import { useHijriByDate } from '../../hooks/useKalenderHijriyah';

interface HijriTextProps {
  date: string | Date | null | undefined;
  fallback?: string;
}

export const HijriText: React.FC<HijriTextProps> = ({ date, fallback = "-" }) => {
  const { data, isLoading } = useHijriByDate(date);

  if (!date) return <>{fallback}</>;
  
  if (isLoading) {
    return <span className="text-gray-500 animate-pulse">Memuat...</span>;
  }

  // Jika sukses, render string_hijri dari database internal ("1 Muharram 1448 H")
  return <>{data?.string_hijri || fallback}</>;
};