// src/components/users/UsersTable.tsx
import React from "react";
import type { UsersResponse } from "../../types/pocketbase-types";
import { roleBadgeClass } from "../../utils/userHelpers";
import { Pencil, KeyRound, Trash2, UserX } from "lucide-react";

interface UsersTableProps {
  users: UsersResponse[];
  getAvatarUrl: (user: UsersResponse) => string | null;
  onEdit: (user: UsersResponse) => void;
  onResetPassword: (user: UsersResponse) => void;
  onDelete: (user: UsersResponse) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  getAvatarUrl,
  onEdit,
  onResetPassword,
  onDelete,
}) => {
  return (
    <div className="hidden md:block relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 shadow-2xl backdrop-blur-xl">
      {/* 🔮 Garis Kilau Top-Border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-950/70 border-b border-gray-800/80 backdrop-blur-md">
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
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-gray-400 shadow-inner">
                      <UserX className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-300">
                        Tidak Ada Pengguna Ditemukan
                      </p>
                      <p className="text-xs text-gray-500">
                        Coba sesuaikan kata kunci pencarian atau filter Anda.
                      </p>
                    </div>
                  </div>
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
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border capitalize shadow-sm ${roleBadgeClass(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Column 3: Status Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border shadow-sm ${
                          user.status
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                          }`}
                        />
                        {user.status ? "Aktif" : "Nonaktif"}
                      </span>
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