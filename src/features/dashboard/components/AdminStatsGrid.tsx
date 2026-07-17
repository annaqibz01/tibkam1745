// src/components/dashboard/admin/AdminStatsGrid.tsx
import React from 'react';
import { Users, UserCheck, ShieldCheck, UserX } from 'lucide-react';
import type { UsersResponse } from '../../../types/pocketbase-types';

interface AdminStatsGridProps {
  users: UsersResponse[];
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({ users }) => {
  // Hitung data real menggunakan fungsi javascript array
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status).length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;
  const nonActiveUsers = totalUsers - activeUsers;

  const activePercentage = ((activeUsers / (totalUsers || 1)) * 100).toFixed(0);

  const cards = [
    {
      title: 'Total Pengguna',
      value: totalUsers.toString(),
      sub: 'Terdaftar di sistem',
      icon: Users,
      gradientText: 'from-indigo-200 via-indigo-300 to-purple-300',
      glowBg: 'bg-indigo-600/15',
      topBorder: 'via-indigo-500/50',
      iconBox: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      dotColor: 'bg-indigo-400',
    },
    {
      title: 'Pengguna Aktif',
      value: activeUsers.toString(),
      sub: `${activePercentage}% dari total akun`,
      icon: UserCheck,
      gradientText: 'from-emerald-200 via-emerald-300 to-teal-300',
      glowBg: 'bg-emerald-600/15',
      topBorder: 'via-emerald-500/50',
      iconBox: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      dotColor: 'bg-emerald-400',
    },
    {
      title: 'Administrator',
      value: adminUsers.toString(),
      sub: 'Akses kontrol penuh',
      icon: ShieldCheck,
      gradientText: 'from-purple-200 via-purple-300 to-pink-300',
      glowBg: 'bg-purple-600/15',
      topBorder: 'via-purple-500/50',
      iconBox: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      dotColor: 'bg-purple-400',
    },
    {
      title: 'Akun Nonaktif',
      value: nonActiveUsers.toString(),
      sub: 'Akses diblokir/ditangguhkan',
      icon: UserX,
      gradientText: 'from-red-200 via-red-300 to-rose-300',
      glowBg: 'bg-red-600/15',
      topBorder: 'via-red-500/50',
      iconBox: 'bg-red-500/10 border-red-500/20 text-red-400',
      dotColor: 'bg-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="relative group overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-5 md:p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-gray-700/80 hover:-translate-y-1 hover:shadow-2xl"
          >
            {/* 🔮 Ambient Glow Mesh Per Kartu */}
            <div
              className={`absolute -top-20 -right-20 w-44 h-44 rounded-full ${card.glowBg} blur-[75px] pointer-events-none transition-all duration-500 group-hover:scale-125`}
            />

            {/* Garis Kilau Top-Border */}
            <div
              className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent ${card.topBorder} to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div className="relative z-10 flex items-start justify-between gap-3">
              {/* Judul & Angka Statistik */}
              <div className="space-y-1">
                <p className="text-[11px] font-mono font-medium text-gray-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p
                  className={`text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${card.gradientText} tracking-tight`}
                >
                  {card.value}
                </p>
              </div>

              {/* Icon Container dengan Glossy Effect */}
              <div
                className={`p-3 rounded-2xl border ${card.iconBox} shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Sub-Info Footer dengan Titik Pulsing */}
            <div className="relative z-10 mt-4 pt-3 border-t border-gray-800/60 flex items-center gap-2 text-[11px] font-mono text-gray-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${card.dotColor} ${
                  card.title === 'Akun Nonaktif' && Number(card.value) > 0 ? 'animate-ping' : 'animate-pulse'
                }`}
              />
              <span className="truncate">{card.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};