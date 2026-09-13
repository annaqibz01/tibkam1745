// src/features/dashboard/components/AdminStatsGrid.tsx
import React from 'react';
import { Users, UserCheck, ShieldCheck, UserX } from 'lucide-react';
import type { UsersResponse } from '../../../types/pocketbase-types';

interface AdminStatsGridProps {
  users: UsersResponse[];
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({ users }) => {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status).length;
  const adminUsers = users.filter((u) => u.role === 'admin' || u.role === 'admin_rambut').length;
  const nonActiveUsers = totalUsers - activeUsers;

  const activePercentage = ((activeUsers / (totalUsers || 1)) * 100).toFixed(0);

  const cards = [
    {
      title: 'Total Pengguna',
      value: totalUsers.toString(),
      sub: 'Akun terdaftar di sistem',
      icon: Users,
      iconColor: 'text-indigo-400',
      dotColor: 'bg-indigo-400',
    },
    {
      title: 'Pengguna Aktif',
      value: activeUsers.toString(),
      sub: `${activePercentage}% akun berstatus aktif`,
      icon: UserCheck,
      iconColor: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
    },
    {
      title: 'Administrator',
      value: adminUsers.toString(),
      sub: 'Hak akses kontrol dan setting',
      icon: ShieldCheck,
      iconColor: 'text-purple-400',
      dotColor: 'bg-purple-400',
    },
    {
      title: 'Akun Nonaktif',
      value: nonActiveUsers.toString(),
      sub: 'Akses ditangguhkan / diblokir',
      icon: UserX,
      iconColor: 'text-rose-400',
      dotColor: 'bg-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 font-sans select-none">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 tracking-tight">
                  {card.value}
                </p>
              </div>

              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 shrink-0">
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className={`w-1.5 h-1.5 rounded-full ${card.dotColor}`} />
              <span className="truncate">{card.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};