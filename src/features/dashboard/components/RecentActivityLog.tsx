// src/components/dashboard/admin/RecentActivityLog.tsx
import React from 'react';
import { UserPlus, Clock, Activity, UserX } from 'lucide-react';
import type { UsersResponse } from '../../../types/pocketbase-types';

interface RecentActivityLogProps {
  users: UsersResponse[];
}

export const RecentActivityLog: React.FC<RecentActivityLogProps> = ({ users }) => {
  // Urutkan data berdasarkan tanggal dibuat (paling baru di atas) dan ambil maksimal 5 item
  const recentRegistrations = [...users]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-5 md:p-6 shadow-2xl backdrop-blur-xl h-full flex flex-col justify-between">
      {/* 🔮 Garis Kilau Top-Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div>
        {/* Header Section */}
        <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-gray-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-mono font-semibold text-gray-300 uppercase tracking-wider">
              Pendaftaran Terbaru
            </h3>
          </div>
          
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-medium text-emerald-400 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Feed
          </span>
        </div>

        {/* Timeline Log List */}
        <div className="relative pl-1">
          {/* Garis alur waktu vertikal dengan efek gradient */}
          {recentRegistrations.length > 0 && (
            <div className="absolute left-[17px] top-3 bottom-3 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/20 to-transparent" />
          )}

          {recentRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="p-3.5 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-500 shadow-inner">
                <UserX className="w-6 h-6" />
              </div>
              <p className="text-xs font-mono text-gray-500">
                Belum ada aktivitas pendaftaran pengguna.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRegistrations.map((targetUser, index) => {
                // Format waktu pendaftaran agar rapi
                const registerDate = new Date(targetUser.created).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={targetUser.id || index}
                    className="group relative flex items-start gap-3.5 p-2.5 rounded-2xl transition-colors duration-200 hover:bg-indigo-500/[0.03]"
                  >
                    {/* Node Icon Timeline Glossy */}
                    <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-950 to-gray-900 border border-indigo-500/30 ring-2 ring-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-md group-hover:scale-110 group-hover:ring-indigo-500/30 transition-all">
                      <UserPlus className="w-3.5 h-3.5" />
                    </div>

                    {/* Detail Konten Aktivitas */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-xs leading-relaxed text-gray-300">
                        Pengguna baru{' '}
                        <span className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {targetUser.name || targetUser.username}
                        </span>{' '}
                        <span className="text-gray-500 font-mono">(@{targetUser.username})</span> terdaftar sebagai{' '}
                        <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[10px] font-semibold capitalize">
                          {targetUser.role}
                        </span>
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[10px] text-gray-500">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>{registerDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};