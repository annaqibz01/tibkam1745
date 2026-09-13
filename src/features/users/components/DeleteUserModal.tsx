// src/features/users/components/DeleteUserModal.tsx
import type { UsersResponse } from "@/types/pocketbase-types";
import type { useUsers } from "../hooks/useUsers";
import { BaseModal } from "@/components/shared/BaseModal";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  user: UsersResponse | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  deleteUser: ReturnType<typeof useUsers>["deleteUser"];
}

export default function DeleteUserModal({
  isOpen,
  user,
  onClose,
  onSuccess,
  onError,
  deleteUser,
}: DeleteUserModalProps) {
  const isPending = deleteUser.isPending;

  const handleDelete = () => {
    if (!user) return;
    deleteUser.mutate(user.id, {
      onSuccess: () => {
        onSuccess(`${user.name || user.username} berhasil dihapus.`);
        onClose();
      },
      onError: (err) => {
        onError(err?.message || "Gagal menghapus pengguna.");
      },
    });
  };

  const userName = user?.name || user?.username || "Pengguna";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Pengguna"
      icon={<Trash2 className="w-4 h-4 text-rose-400" />}
      maxWidth="max-w-md"
    >
      <div className="text-center space-y-4 py-1">
        <div className="w-12 h-12 mx-auto rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-zinc-300">
            Apakah Anda yakin ingin menghapus{" "}
            <span className="text-white font-semibold underline decoration-rose-500/50 underline-offset-4">
              {userName}
            </span>{" "}
            secara permanen?
          </p>
          <p className="text-xs text-rose-400/80 font-medium">Tindakan ini tidak dapat dibatalkan.</p>
        </div>

        <div className="flex justify-center gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 h-9 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Hapus Permanen</span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}