// src/features/users/components/ResetPasswordModal.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseModal } from "@/components/shared/BaseModal";
import type { UsersResponse } from "@/types/pocketbase-types";
import type { useUsers } from "../hooks/useUsers";
import { Eye, EyeOff, Loader2, KeyRound, AlertCircle } from "lucide-react";

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });

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
      },
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Kata Sandi"
      icon={<KeyRound className="w-4 h-4 text-amber-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Info Pengguna */}
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          Mengubah kata sandi untuk{" "}
          <span className="font-semibold text-white">{user?.name || user?.username}</span> tanpa
          memerlukan kata sandi lama.
        </div>

        {/* Kata Sandi Baru */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Kata Sandi Baru</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              disabled={isPending}
              className={`w-full h-9 px-3 bg-zinc-950 border rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.password
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                  : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500"
              }`}
              placeholder="Min. 8 karakter"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
        </div>

        {/* Konfirmasi Kata Sandi */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Konfirmasi Kata Sandi</label>
          <div className="relative">
            <input
              {...register("passwordConfirm")}
              type={showPasswordConfirm ? "text" : "password"}
              disabled={isPending}
              className={`w-full h-9 px-3 bg-zinc-950 border rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.passwordConfirm
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                  : "border-zinc-800 focus:border-amber-500 focus:ring-amber-500"
              }`}
              placeholder="Ulangi kata sandi"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
            >
              {showPasswordConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.passwordConfirm && (
            <p className="mt-1 text-xs text-rose-400">{errors.passwordConfirm.message}</p>
          )}
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 h-9 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <KeyRound className="w-3.5 h-3.5" />
            )}
            <span>Reset Password</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
}