// src/features/dashboard/components/RecentActivityLog.tsx
import React from 'react';
import { UserPlus, Clock, Activity, UserX } from 'lucide-react';
import type { UsersResponse } from '../../../types/pocketbase-types';

interface RecentActivityLogProps {
  users: UsersResponse[];
}

export const RecentActivityLog: React.FC<RecentActivityLogProps> = ({ users }) => {
  const recentRegistrations = [...users]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5 shadow-sm font-sans select-none">
      {/* Header Panel */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-zinc-800 text-zinc-300">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Pendaftaran Pengguna Terbaru
          </h3>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Live Update
        </span>
      </div>

      {/* Timeline List */}
      <div className="relative">
        {recentRegistrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500">
              <UserX className="w-5 h-5" />
            </div>
            <p className="text-xs text-zinc-500">
              Belum ada riwayat aktivitas pendaftaran.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {recentRegistrations.map((targetUser, index) => {
              const registerDate = new Date(targetUser.created).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={targetUser.id || index}
                  className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1 hover:bg-zinc-800/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
                      <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                    </div>

                    <div className="min-w-0 truncate">
                      <p className="text-xs text-zinc-200 font-medium truncate">
                        {targetUser.name || targetUser.username}
                        <span className="text-zinc-500 font-mono text-[11px] ml-1.5">
                          (@{targetUser.username})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium capitalize bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {targetUser.role}
                    </span>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                      <Clock className="w-3 h-3" />
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
  );
};