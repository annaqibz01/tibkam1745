// src/components/users/EditUserModal.tsx
import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseModal } from "../../../components/shared/BaseModal";
import { roleBadgeClass } from "../../../utils/userHelpers";
import type { UsersResponse } from "../../../types/pocketbase-types";
import type { useUsers } from "../hooks/useUsers";
import { User, Pencil, Loader2, AlertCircle } from "lucide-react";

// 1. Skema Validasi Zod
const editUserSchema = z.object({
  name: z.string().trim().min(1, "Nama tidak boleh kosong."),
  status: z.boolean(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  user: UsersResponse;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  adminUpdateUser: ReturnType<typeof useUsers>["adminUpdateUser"];
  getAvatarUrl: (user: UsersResponse | null) => string | null;
}

export default function EditUserModal({
  isOpen,
  user,
  onClose,
  onSuccess,
  onError,
  adminUpdateUser,
  getAvatarUrl,
}: EditUserModalProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPending = adminUpdateUser.isPending;

  // 2. React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      status: true,
    },
  });

  // Sinkronkan state form setiap kali modal dibuka / data user berubah
  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name ?? "",
        status: user.status ?? true,
      });
      setAvatarFile(null);
      setRemoveAvatar(false);
      setAvatarPreview(getAvatarUrl(user));
      setServerError(null);
    }
  }, [isOpen, user, getAvatarUrl, reset]);

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

  const onSubmit = (data: EditUserFormValues) => {
    setServerError(null);
    if (!user) return;

    adminUpdateUser.mutate(
      {
        id: user.id,
        name: data.name,
        status: data.status,
        avatarFile,
        removeAvatar,
      },
      {
        onSuccess: () => {
          onSuccess(`Data ${data.name || user.username} berhasil diperbarui.`);
          onClose();
        },
        onError: (err) => {
          const msg = err?.message || "Gagal memperbarui pengguna.";
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
      title={user ? `Edit Pengguna (@${user.username})` : "Edit Pengguna"}
      icon={<Pencil className="w-5 h-5" />}
      maxWidth="max-w-lg"
    >
      {/* ✨ Ditambahkan px-6 pb-6 pt-2 agar sisi kanan-kiri tidak mepet */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-2">
        {/* Avatar preview & controls */}
        <div className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-800/40 border border-gray-800">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 flex items-center justify-center flex-shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-gray-500" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs font-medium text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ganti Foto
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleRemoveAvatar}
                  className="px-3 py-1.5 bg-red-600/10 border border-red-500/30 rounded-lg text-xs font-medium text-red-400 hover:bg-red-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hapus
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={isPending}
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label
              htmlFor="edit-name"
              className="block text-xs font-medium text-gray-300 mb-1"
            >
              Nama Lengkap
            </label>
            <input
              id="edit-name"
              type="text"
              disabled={isPending}
              {...register("name")}
              className={`w-full px-3.5 py-2 bg-gray-800 border rounded-xl text-white text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.name
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                  : "border-gray-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              }`}
              placeholder="Masukkan nama lengkap"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Role Read-only & Status Toggle Switch */}
          <div className="grid grid-cols-2 gap-4 items-center pt-1">
            {/* Role Read-Only Badge */}
            <div>
              <span className="block text-xs font-medium text-gray-400 mb-1">
                Role Pengguna
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border capitalize ${roleBadgeClass(
                  user?.role
                )}`}
              >
                {user?.role || "—"}
              </span>
            </div>

            {/* Status Toggle Switch dengan Controller */}
            <div>
              <span className="block text-xs font-medium text-gray-400 mb-1">
                Status Akun
              </span>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      disabled={isPending}
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        field.value ? "bg-indigo-600" : "bg-gray-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          field.value ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-xs font-semibold ${
                        field.value ? "text-emerald-400" : "text-gray-400"
                      }`}
                    >
                      {field.value ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                )}
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
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4" />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
}