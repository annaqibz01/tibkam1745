// src/features/profile/components/EditProfileModal.tsx
import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UsersResponse } from "../../../types/pocketbase-types";
import { getAvatarUrl, useUpdateUser } from "../../users/hooks/useUsers";
import { Camera, Trash2, User, Loader2, Save, Lock, AlertCircle } from "lucide-react";
import { BaseModal } from "../../../components/shared/BaseModal";

// 1. Skema Validasi Zod
const editProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama lengkap wajib diisi."),
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UsersResponse | null;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { mutate: updateUser, isPending } = useUpdateUser();

  // 2. Setup React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: "",
    },
  });

  // Sinkronkan state form & avatar saat modal dibuka atau data user berubah
  useEffect(() => {
    if (user && isOpen) {
      reset({
        name: user.name ?? "",
      });
      setAvatarFile(null);
      setRemoveAvatar(false);
      setAvatarPreview(getAvatarUrl(user));
      setServerError(null);
    }
  }, [user, isOpen, reset]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (data: EditProfileFormValues) => {
    setServerError(null);
    if (!user) return;

    updateUser(
      {
        id: user.id,
        name: data.name,
        avatarFile,
        removeAvatar,
      },
      {
        onSuccess: () => {
          onSuccess("Profil berhasil diperbarui!");
          onClose();
        },
        onError: (err: Error) => {
          const msg = err.message || "Gagal memperbarui profil.";
          onError(msg);
          setServerError(msg);
        },
      }
    );
  };

  // Inisial nama jika foto belum ada
  const nameInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.username
      ? user.username.charAt(0).toUpperCase()
      : "?";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Informasi Profil"
      icon={<User className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 📸 1. AVATAR EDIT SECTION */}
        <div className="flex flex-col items-center justify-center pt-1 pb-3 border-b border-zinc-800">
          <div className="group relative inline-flex items-center justify-center">
            {/* Circle Avatar Frame */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-indigo-500/20 border-2 border-indigo-500/30 bg-zinc-800 flex items-center justify-center shadow-lg transition-all duration-200 group-hover:ring-indigo-500/40">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-mono text-3xl font-extrabold text-indigo-300">
                  {nameInitial}
                </span>
              )}
            </div>

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-zinc-950/75 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <button
                type="button"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full bg-indigo-600/80 text-white hover:bg-indigo-500 active:scale-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4" />
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleRemoveAvatar}
                  className="p-2.5 rounded-full bg-red-600/80 text-white hover:bg-red-500 active:scale-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Hapus Foto Profil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={isPending}
            onChange={handleAvatarChange}
            className="hidden"
          />
          <span className="mt-2.5 text-[11px] font-mono text-zinc-400">
            Arahkan kursor pada foto untuk mengganti atau menghapus
          </span>
        </div>

        {/* 📝 2. FORM INPUTS */}
        <div className="space-y-3">
          {/* Input Nama Lengkap */}
          <div>
            <label
              htmlFor="edit-name"
              className="block text-[11px] font-medium text-zinc-300 mb-1"
            >
              Nama Lengkap
            </label>
            <input
              id="edit-name"
              type="text"
              disabled={isPending}
              {...register("name")}
              placeholder="Masukkan nama lengkap"
              className={`w-full h-9 px-3 bg-zinc-950 border rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.name
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                  : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
            )}
          </div>

          {/* Readonly Username */}
          <div>
            <label
              htmlFor="edit-username"
              className="block text-[11px] font-medium text-zinc-500 mb-1"
            >
              Username Sistem <span className="text-zinc-600">(Tidak dapat diubah)</span>
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="edit-username"
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full h-9 pl-9 pr-3 bg-zinc-900/40 border border-zinc-800/60 rounded-lg text-zinc-500 font-mono text-xs cursor-not-allowed select-none"
              />
            </div>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* 🚪 3. MODAL FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
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
            className="inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-colors active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};