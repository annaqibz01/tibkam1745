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
    <div className="hidden md:block relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed border-collapse font-sans">
          <thead>
            <tr className="bg-gray-950/70 border-b border-gray-800/80 backdrop-blur-md select-none">
              <th className="w-[30%] px-6 py-4 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider text-left">
                Pengguna
              </th>
              <th className="w-[15%] px-6 py-4 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider text-left">
                Role
              </th>
              <th className="w-[15%] px-6 py-4 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider text-left">
                Status
              </th>
              <th className="w-[20%] px-6 py-4 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider text-left">
                Terdaftar
              </th>
              <th className="w-[20%] px-6 py-4 text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8">
                  <EmptyState
                    icon={<UserX className="w-8 h-8 text-gray-400" />}
                    title="Tidak Ada Pengguna Ditemukan"
                    description="Coba sesuaikan kata kunci pencarian atau filter role/status Anda."
                  />
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const avatar = getAvatarUrl(user);
                return (
                  <tr
                    key={user.id}
                    className="group transition-colors duration-200 hover:bg-indigo-500/[0.03]"
                  >
                    {/* Column 1: Info User & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 border border-gray-700 flex-shrink-0 shadow-md group-hover:ring-indigo-500/40 transition-all"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-950 to-gray-800 flex items-center justify-center text-indigo-300 font-mono font-bold text-sm ring-2 ring-indigo-500/20 border border-indigo-500/30 flex-shrink-0 shadow-md group-hover:ring-indigo-500/40 transition-all">
                            {(user.name || user.username).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-200 text-sm truncate group-hover:text-indigo-300 transition-colors">
                            {user.name || user.username}
                          </p>
                          <p className="text-xs font-mono text-gray-500 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Role Badge */}
                    <td className="px-6 py-4">
                      <StatusBadge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </StatusBadge>
                    </td>

                    {/* Column 3: Status Badge */}
                    <td className="px-6 py-4">
                      <StatusBadge
                        variant={user.status ? "success" : "danger"}
                        dot
                      >
                        {user.status ? "Aktif" : "Nonaktif"}
                      </StatusBadge>
                    </td>

                    {/* Column 4: Registered Date */}
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {new Date(user.created).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Column 5: Action Buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          className="p-2 rounded-xl text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 active:scale-95 transition-all"
                          title="Edit data & role"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onResetPassword(user)}
                          className="p-2 rounded-xl text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 active:scale-95 transition-all"
                          title="Reset kata sandi"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(user)}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 active:scale-95 transition-all"
                          title="Hapus pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
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