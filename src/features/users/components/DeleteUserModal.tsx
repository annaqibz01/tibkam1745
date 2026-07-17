// src/components/users/DeleteUserModal.tsx
import type { UsersResponse } from "@/types/pocketbase-types";
import type { useUsers } from "../hooks/useUsers";
import { BaseModal } from "@/components/shared/BaseModal"; // ✨ 1. Pakai BaseModal
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean; // ✨ 2. Tambahkan prop isOpen
  user: UsersResponse | null; // ✨ 3. Izinkan null untuk keamanan animasi exit
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

  // Safe fallback name jika user ter-reset ke null saat animasi keluar
  const userName = user?.name || user?.username || "Pengguna";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Pengguna"
      icon={<Trash2 className="w-5 h-5 text-red-400" />}
      maxWidth="max-w-md"
    >
      <div className="text-center space-y-4 py-2">
        {/* Ikon Peringatan Bahaya */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm text-gray-300">
            Apakah Anda yakin ingin menghapus{" "}
            <span className="text-white font-semibold underline decoration-red-500/50 underline-offset-4">
              {userName}
            </span>{" "}
            secara permanen?
          </p>
          <p className="text-xs text-red-400/80 font-medium">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Hapus Permanen</span>
          </button>
        </div>
      </div>
    </BaseModal>
  );
}