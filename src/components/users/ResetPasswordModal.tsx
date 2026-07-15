// src/components/users/ResetPasswordModal.tsx
import { useState, useEffect, type FormEvent } from "react";
import { BaseModal } from "../shared/BaseModal"; // ✨ 1. Import BaseModal
import type { UsersResponse } from "../../types/pocketbase-types";
import type { useUsers } from "../../hooks/useUsers";
import { Eye, EyeOff, Loader2, KeyRound, AlertCircle } from "lucide-react";

interface ResetPasswordModalProps {
  isOpen: boolean; // ✨ 2. Tambahkan prop isOpen
  user: UsersResponse;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  adminUpdateUser: ReturnType<typeof useUsers>["adminUpdateUser"];
}

export default function ResetPasswordModal({
  isOpen,
  user,
  onClose,
  onSuccess,
  onError,
  adminUpdateUser,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isPending = adminUpdateUser.isPending;

  // ✨ 3. Reset otomatis isi form saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setPasswordConfirm("");
      setShow(false);
      setLocalError(null);
    }
  }, [isOpen]);

  const validate = () => {
    if (!password) return "Kata sandi baru wajib diisi.";
    if (password.length < 8) return "Kata sandi minimal 8 karakter.";
    if (password !== passwordConfirm) return "Kata sandi tidak cocok.";
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!user) return;

    const err = validate();
    if (err) {
      setLocalError(err);
      return;
    }

    adminUpdateUser.mutate(
      { id: user.id, password, passwordConfirm },
      {
        onSuccess: () => {
          onSuccess(`Kata sandi untuk @${user.username} berhasil direset.`);
          onClose();
        },
        onError: (err) => {
          const msg = err?.message || "Gagal mereset kata sandi.";
          onError(msg);
          setLocalError(msg);
        },
      }
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Kata Sandi"
      icon={<KeyRound className="w-5 h-5 text-amber-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Pengguna */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
          Mengubah kata sandi untuk{" "}
          <span className="font-semibold text-white">
            {user?.name || user?.username}
          </span>{" "}
          tanpa memerlukan kata sandi lama.
        </div>

        {/* Kata Sandi Baru */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder-gray-500"
              placeholder="Min. 8 karakter"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Konfirmasi Kata Sandi */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Konfirmasi Kata Sandi
          </label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            placeholder="Ulangi kata sandi"
          />
        </div>

        {localError && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-[0.98]"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            <span>Reset Password</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
}