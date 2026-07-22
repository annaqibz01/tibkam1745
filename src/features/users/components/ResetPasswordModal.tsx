// src/components/users/ResetPasswordModal.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseModal } from "@/components/shared/BaseModal";
import type { UsersResponse } from "@/types/pocketbase-types";
import type { useUsers } from "../hooks/useUsers";
import { Eye, EyeOff, Loader2, KeyRound, AlertCircle } from "lucide-react";

// 1. Skema Validasi Zod
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Kata sandi minimal 8 karakter."),
    passwordConfirm: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Kata sandi dan konfirmasi tidak cocok.",
    path: ["passwordConfirm"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordModalProps {
  isOpen: boolean;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isPending = adminUpdateUser.isPending;

  // 2. React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  // Reset form & state saat modal ditutup
  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowPassword(false);
      setShowPasswordConfirm(false);
      setServerError(null);
    }
  }, [isOpen, reset]);

  const onSubmit = (data: ResetPasswordFormValues) => {
    setServerError(null);
    if (!user) return;

    adminUpdateUser.mutate(
      {
        id: user.id,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      },
      {
        onSuccess: () => {
          onSuccess(`Kata sandi untuk @${user.username} berhasil direset.`);
          onClose();
        },
        onError: (err) => {
          const msg = err?.message || "Gagal mereset kata sandi.";
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
      title="Reset Kata Sandi"
      icon={<KeyRound className="w-5 h-5 text-amber-400" />}
      maxWidth="max-w-md"
    >
      {/* ✨ Ditambahkan px-6 pb-6 pt-2 agar jarak kanan-kiri dan bawah tidak mepet */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-2">
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
              {...register("password")}
              type={showPassword ? "text" : "password"}
              disabled={isPending}
              className={`w-full px-3.5 py-2 bg-gray-800 border rounded-xl text-white text-sm focus:outline-none transition-all placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                  : "border-gray-700 focus:ring-2 focus:ring-amber-500/50"
              }`}
              placeholder="Min. 8 karakter"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Konfirmasi Kata Sandi */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <input
              {...register("passwordConfirm")}
              type={showPasswordConfirm ? "text" : "password"}
              disabled={isPending}
              className={`w-full px-3.5 py-2 bg-gray-800 border rounded-xl text-white text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.passwordConfirm
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                  : "border-gray-700 focus:ring-2 focus:ring-amber-500/50"
              }`}
              placeholder="Ulangi kata sandi"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {showPasswordConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
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

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-[0.98]"
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