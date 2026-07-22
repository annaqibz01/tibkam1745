// src/components/profile/ChangePasswordModal.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateUser } from "../../users/hooks/useUsers";
import { KeyRound, Lock, Eye, EyeOff, Loader2, Save, AlertCircle } from "lucide-react";
import { BaseModal } from "../../../components/shared/BaseModal";

// 1. Skema Validasi Zod
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Kata sandi lama wajib diisi."),
    password: z.string().min(8, "Kata sandi baru minimal 8 karakter."),
    passwordConfirm: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Kata sandi baru dan konfirmasi tidak cocok.",
    path: ["passwordConfirm"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

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
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: updateUser, isPending } = useUpdateUser();

  // 2. Setup React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      password: "",
      passwordConfirm: "",
    },
  });

  // Reset form & state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setServerError(null);
    }
  }, [isOpen, reset]);

  const onSubmit = (data: ChangePasswordFormValues) => {
    setServerError(null);

    updateUser(
      {
        id: userId,
        oldPassword: data.oldPassword,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      },
      {
        onSuccess: () => {
          onSuccess("Kata sandi berhasil diubah!");
          onClose();
        },
        onError: (err: Error) => {
          const msg = err.message || "Gagal mengubah kata sandi.";
          onError(msg);
          setServerError(msg);
        },
      }
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubah Kata Sandi"
      icon={<KeyRound className="w-5 h-5 text-amber-400" />}
      maxWidth="max-w-lg"
    >
      {/* ✨ Ditambahkan px-6 pb-6 pt-2 agar sisi kanan-kiri tidak mepet */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-2">
        {/* Kata Sandi Lama */}
        <div>
          <label htmlFor="oldPassword" className="block text-xs font-medium text-gray-300 mb-1.5">
            Kata Sandi Lama
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="oldPassword"
              {...register("oldPassword")}
              type={showOldPassword ? "text" : "password"}
              disabled={isPending}
              placeholder="Masukkan kata sandi lama"
              className={`w-full pl-10 pr-12 py-2.5 bg-gray-800 border rounded-xl text-white text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.oldPassword
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                  : "border-gray-700 focus:ring-2 focus:ring-amber-500/50"
              }`}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="mt-1 text-xs text-red-400">{errors.oldPassword.message}</p>
          )}
        </div>

        {/* Kata Sandi Baru */}
        <div>
          <label htmlFor="newPassword" className="block text-xs font-medium text-gray-300 mb-1.5">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="newPassword"
              {...register("password")}
              type={showNewPassword ? "text" : "password"}
              disabled={isPending}
              placeholder="Min. 8 karakter"
              className={`w-full pl-10 pr-12 py-2.5 bg-gray-800 border rounded-xl text-white text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                  : "border-gray-700 focus:ring-2 focus:ring-amber-500/50"
              }`}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Konfirmasi Kata Sandi Baru */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-300 mb-1.5">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              id="confirmPassword"
              {...register("passwordConfirm")}
              type={showConfirmPassword ? "text" : "password"}
              disabled={isPending}
              placeholder="Ulangi kata sandi baru"
              className={`w-full pl-10 pr-12 py-2.5 bg-gray-800 border rounded-xl text-white text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.passwordConfirm
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                  : "border-gray-700 focus:ring-2 focus:ring-amber-500/50"
              }`}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.passwordConfirm && (
            <p className="mt-1 text-xs text-red-400">{errors.passwordConfirm.message}</p>
          )}
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all"
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