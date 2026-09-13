// src/components/shared/HijriText.tsx
import React from 'react';
import { useHijriByDate } from '../../features/kalender/hooks/useKalenderHijriyah';

interface HijriTextProps {
  date: string | Date | null | undefined;
  fallback?: string;
}

export const HijriText: React.FC<HijriTextProps> = ({ date, fallback = "-" }) => {
  const { data, isLoading } = useHijriByDate(date);

  if (!date) return <>{fallback}</>;

  if (isLoading) {
    return <span className="text-zinc-500">Memuat...</span>;
  }

  return <>{data?.string_hijri || fallback}</>;
};