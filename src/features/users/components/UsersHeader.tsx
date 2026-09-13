// src/features/users/components/UsersHeader.tsx
import React from "react";
import { Users, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

interface UsersHeaderProps {
  onOpenCreateModal: () => void;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({ onOpenCreateModal }) => {
  return (
    <PageHeader
      badgeIcon={<Users className="w-3.5 h-3.5" />}
      badgeLabel="Akses & Hak Pengguna"
      title={
        <span className="font-sans font-bold text-white tracking-tight">
          Kelola <span className="text-indigo-400">Pengguna</span>
        </span>
      }
      description="Manajemen akun, role, dan kredensial seluruh pengguna sistem dalam satu tempat terpadu."
      actions={
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-colors active:scale-[0.98] flex items-center gap-2 select-none"
        >
          <UserPlus className="w-4 h-4 text-white" />
          <span>Tambah Pengguna</span>
        </button>
      }
    />
  );
};