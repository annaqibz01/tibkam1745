// src/features/profile/components/ChangePasswordModal.tsx
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
      icon={<KeyRound className="w-4 h-4 text-amber-400" />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Kata Sandi Lama */}
        <div>
          <label htmlFor="oldPassword" className="block text-[11px] font-medium text-zinc-300 mb-1">
            Kata Sandi Lama
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="oldPassword"
              {...register("oldPassword")}
              type={showOldPassword ? "text" : "password"}
              disabled={isPending}
              placeholder="Masukkan kata sandi lama"
              className={`w-full h-9 pl-9 pr-9 bg-zinc-950 border rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.oldPassword
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                  : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500"
              }`}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
            >
              {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.oldPassword && (
            <p className="mt-1 text-xs text-rose-400">{errors.oldPassword.message}</p>
          )}
        </div>

        {/* Kata Sandi Baru */}
        <div>
          <label htmlFor="newPassword" className="block text-[11px] font-medium text-zinc-300 mb-1">
            Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="newPassword"
              {...register("password")}
              type={showNewPassword ? "text" : "password"}
              disabled={isPending}
              placeholder="Min. 8 karakter"
              className={`w-full h-9 pl-9 pr-9 bg-zinc-950 border rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.password
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                  : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500"
              }`}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
            >
              {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
          )}
        </div>

        {/* Konfirmasi Kata Sandi Baru */}
        <div>
          <label htmlFor="confirmPassword" className="block text-[11px] font-medium text-zinc-300 mb-1">
            Konfirmasi Kata Sandi Baru
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="confirmPassword"
              {...register("passwordConfirm")}
              type={showConfirmPassword ? "text" : "password"}
              disabled={isPending}
              placeholder="Ulangi kata sandi baru"
              className={`w-full h-9 pl-9 pr-9 bg-zinc-950 border rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.passwordConfirm
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                  : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500"
              }`}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
            >
              {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.passwordConfirm && (
            <p className="mt-1 text-xs text-rose-400">{errors.passwordConfirm.message}</p>
          )}
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 h-9 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-colors active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mengubah...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Ubah Sandi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};