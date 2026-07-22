// src/components/profile/EditProfileModal.tsx
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
      icon={<User className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-lg"
    >
      {/* ✨ Ditambahkan px-6 pb-6 pt-2 agar jarak kanan-kiri dan bawah tidak mepet */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6 pt-2">
        {/* 📸 1. AVATAR EDIT SECTION */}
        <div className="flex flex-col items-center justify-center pt-2 pb-3 border-b border-gray-800/80">
          <div className="group relative inline-flex items-center justify-center">
            {/* Circle Avatar Frame */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-indigo-500/20 border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-950 to-gray-800 flex items-center justify-center shadow-xl transition-all duration-300 group-hover:ring-indigo-500/40">
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
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-gray-950/75 backdrop-blur-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
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
          <span className="mt-2.5 text-[11px] font-mono text-gray-400">
            Arahkan kursor pada foto untuk mengganti atau menghapus
          </span>
        </div>

        {/* 📝 2. FORM INPUTS */}
        <div className="space-y-4">
          {/* Input Nama Lengkap */}
          <div>
            <label
              htmlFor="edit-name"
              className="block text-xs font-mono font-medium text-gray-300 mb-1.5"
            >
              Nama Lengkap
            </label>
            <input
              id="edit-name"
              type="text"
              disabled={isPending}
              {...register("name")}
              placeholder="Masukkan nama lengkap"
              className={`w-full px-4 py-2.5 bg-gray-950/60 border rounded-2xl text-white text-sm placeholder-gray-500 focus:outline-none transition-all duration-200 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.name
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                  : "border-gray-800 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Readonly Username */}
          <div>
            <label
              htmlFor="edit-username"
              className="block text-xs font-mono font-medium text-gray-500 mb-1.5"
            >
              Username Sistem <span className="text-gray-600">(Tidak dapat diubah)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-600 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="edit-username"
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/40 border border-gray-800/60 rounded-2xl text-gray-500 font-mono text-sm cursor-not-allowed select-none"
              />
            </div>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* 🚪 3. MODAL FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4.5 py-2.5 rounded-2xl border border-gray-800 bg-gray-900/80 text-gray-300 hover:bg-gray-800 hover:text-white text-xs font-mono font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-mono font-semibold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all duration-200"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};