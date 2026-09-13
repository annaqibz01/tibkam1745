// src/features/users/components/EditUserModal.tsx
import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseModal } from "../../../components/shared/BaseModal";
import { roleBadgeClass } from "../../../utils/userHelpers";
import type { UsersResponse } from "../../../types/pocketbase-types";
import type { useUsers } from "../hooks/useUsers";
import { User, Pencil, Loader2, AlertCircle } from "lucide-react";

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

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { name: "", status: true },
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({ name: user.name ?? "", status: user.status ?? true });
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
      },
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? `Edit Pengguna (@${user.username})` : "Edit Pengguna"}
      icon={<Pencil className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Avatar preview & controls */}
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center flex-shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-zinc-500" />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={isPending}
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-md text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ganti Foto
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleRemoveAvatar}
                  className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-md text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="space-y-3">
          {/* Nama Lengkap */}
          <div>
            <label htmlFor="edit-name" className="block text-xs font-medium text-zinc-300 mb-1">
              Nama Lengkap
            </label>
            <input
              id="edit-name"
              type="text"
              disabled={isPending}
              {...register("name")}
              className={`w-full h-9 px-3 bg-zinc-950 border rounded-lg text-xs text-zinc-100 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.name
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                  : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
              }`}
              placeholder="Masukkan nama lengkap"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
          </div>

          {/* Role Read-only & Status Toggle Switch */}
          <div className="grid grid-cols-2 gap-3 items-center pt-1">
            <div>
              <span className="block text-xs font-medium text-zinc-400 mb-1">Role Pengguna</span>
              <span
                className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold border capitalize ${roleBadgeClass(
                  user?.role,
                )}`}
              >
                {user?.role || "—"}
              </span>
            </div>

            <div>
              <span className="block text-xs font-medium text-zinc-400 mb-1">Status Akun</span>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      disabled={isPending}
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        field.value ? "bg-indigo-600" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          field.value ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-semibold ${field.value ? "text-emerald-400" : "text-zinc-400"}`}>
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
            className="inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Pencil className="w-3.5 h-3.5" />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
}