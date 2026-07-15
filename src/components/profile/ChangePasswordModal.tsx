// src/components/profile/ChangePasswordModal.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { useUpdateUser } from "../../hooks/useUsers";
import { KeyRound, Lock, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { BaseModal } from "../shared/BaseModal";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
  onError,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: updateUser, isPending } = useUpdateUser();

  // ✨ Otomatis bersihkan form setiap kali modal dibuka/ditutup
  useEffect(() => {
    if (!isOpen) {
      setOldPassword("");
      setPassword("");
      setPasswordConfirm("");
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  // ⛔ HAPUS BARIS: if (!isOpen) return null; (agar AnimatePresence bekerja)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!oldPassword) {
      onError("Kata sandi lama wajib diisi.");
      return;
    }
    if (password !== passwordConfirm) {
      onError("Kata sandi baru dan konfirmasi tidak cocok.");
      return;
    }
    if (password.length < 8) {
      onError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    updateUser(
      {
        id: userId,
        oldPassword,
        password,
        passwordConfirm,
      },
      {
        onSuccess: () => {
          onSuccess("Kata sandi berhasil diubah!");
          onClose();
        },
        onError: (err: Error) => {
          onError(err.message || "Gagal mengubah kata sandi.");
        },
      }
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubah Kata Sandi"
      icon={<KeyRound className="w-5 h-5" />}
      maxWidth="max-w-lg"
    >
      {/* ✨ Langsung form tanpa wrapper div ganda */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Old Password */}
        <div>
          <label htmlFor="oldPassword" className="block text-xs font-medium text-gray-300 mb-1.5">
            Kata Sandi Lama
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              id="oldPassword"
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan kata sandi lama"
              className="w-full pl-10 pr-12 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-xs font-medium text-gray-300 mb-1.5">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 karakter"
              className="w-full pl-10 pr-12 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-300 mb-1.5">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full pl-10 pr-12 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/20 transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengubah...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Ubah Sandi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};