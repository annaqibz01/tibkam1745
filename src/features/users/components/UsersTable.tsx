// src/features/users/components/UsersTable.tsx
import React from "react";
import type { UsersResponse, UsersRoleOptions } from "@/types/pocketbase-types";
import { StatusBadge, type BadgeVariant, EmptyState } from "@/components/shared";
import { Pencil, KeyRound, Trash2, UserX } from "lucide-react";

interface UsersTableProps {
  users: UsersResponse[];
  getAvatarUrl: (user: UsersResponse) => string | null;
  onEdit: (user: UsersResponse) => void;
  onResetPassword: (user: UsersResponse) => void;
  onDelete: (user: UsersResponse) => void;
}

const getRoleBadgeVariant = (role?: UsersRoleOptions | string): BadgeVariant => {
  switch (role) {
    case "admin":
      return "info";
    case "admin_rambut":
      return "warning";
    case "rambut":
      return "info";
    case "umum":
      return "neutral";
    default:
      return "neutral";
  }
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  getAvatarUrl,
  onEdit,
  onResetPassword,
  onDelete,
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-xs table-fixed border-collapse font-sans">
          <thead>
            <tr className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider select-none">
              <th className="w-[30%] px-3 py-2.5 text-left">Pengguna</th>
              <th className="w-[15%] px-3 py-2.5 text-left">Role</th>
              <th className="w-[15%] px-3 py-2.5 text-left">Status</th>
              <th className="w-[20%] px-3 py-2.5 text-left">Terdaftar</th>
              <th className="w-[20%] px-3 py-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8">
                  <EmptyState
                    icon={<UserX className="w-6 h-6 text-zinc-500" />}
                    title="Tidak Ada Pengguna Ditemukan"
                    description="Coba sesuaikan kata kunci pencarian atau filter role/status Anda."
                  />
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const avatar = getAvatarUrl(user);
                return (
                  <tr key={user.id} className="hover:bg-zinc-800/40 transition-colors">
                    {/* Kolom 1: Info User & Avatar */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-indigo-300 font-bold text-xs border border-zinc-700 flex-shrink-0">
                            {(user.name || user.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-200 truncate">
                            {user.name || user.username}
                          </p>
                          <p className="text-xs font-mono text-zinc-500 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Kolom 2: Role Badge */}
                    <td className="px-3 py-2">
                      <StatusBadge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </StatusBadge>
                    </td>

                    {/* Kolom 3: Status Badge */}
                    <td className="px-3 py-2">
                      <StatusBadge variant={user.status ? "success" : "danger"} dot>
                        {user.status ? "Aktif" : "Nonaktif"}
                      </StatusBadge>
                    </td>

                    {/* Kolom 4: Registered Date */}
                    <td className="px-3 py-2 text-xs font-mono text-zinc-400">
                      {new Date(user.created).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Kolom 5: Action Buttons */}
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Edit data & role"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onResetPassword(user)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Reset kata sandi"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(user)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Hapus pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};