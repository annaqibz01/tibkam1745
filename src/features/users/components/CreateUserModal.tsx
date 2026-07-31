// src/features/users/components/CreateUserModal.tsx
import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseModal } from "@/components/shared/BaseModal";
import { ROLE_OPTIONS } from "@/utils/userHelpers";
import type { UsersRoleOptions } from "@/types/pocketbase-types";
import { useUsers } from "../hooks/useUsers";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  AlertCircle,
  Check,
  Lock,
  ShieldAlert,
} from "lucide-react";

const createUserSchema = z
  .object({
    name: z.string().trim().min(1, "Nama lengkap wajib diisi."),
    username: z.string().trim().min(1, "Username wajib diisi."),
    role: z.string().min(1, "Role wajib dipilih."),
    password: z.string().min(8, "Kata sandi minimal 8 karakter."),
    passwordConfirm: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Kata sandi dan konfirmasi tidak cocok.",
    path: ["passwordConfirm"],
  });

type CreateUserFormValues = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  createUser: ReturnType<typeof useUsers>["createUser"];
  isAdminRambut?: boolean;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  createUser,
  isAdminRambut = false,
}: CreateUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isPending = createUser?.isPending ?? false;

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      username: "",
      role: isAdminRambut ? "rambut" : "umum",
      password: "",
      passwordConfirm: "",
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      reset({
        name: "",
        username: "",
        role: isAdminRambut ? "rambut" : "umum",
        password: "",
        passwordConfirm: "",
      });
      setShowPassword(false);
      setShowPasswordConfirm(false);
      setServerError(null);
    } else if (isAdminRambut) {
      setValue("role", "rambut");
    }
  }, [isOpen, reset, isAdminRambut, setValue]);

  const onSubmit = (data: CreateUserFormValues) => {
    setServerError(null);

    if (!createUser?.mutate) {
      setServerError("Fungsi 'createUser' belum siap.");
      return;
    }

    // Fail-safe: Pastikan role tetap 'rambut' jika dibuat oleh admin_rambut
    const finalRole = isAdminRambut ? "rambut" : (data.role as UsersRoleOptions);

    createUser.mutate(
      {
        name: data.name,
        username: data.username,
        email: `${data.username}@tibkam.local`,
        role: finalRole,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        status: true,
      },
      {
        onSuccess: () => onSuccess("Pengguna baru berhasil ditambahkan."),
        onError: (err) => {
          const msg = err?.message || "Gagal menambahkan pengguna.";
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
      title="Tambah Pengguna Baru"
      icon={<UserPlus className="w-5 h-5" />}
      maxWidth="max-w-xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 px-6 pb-6 pt-2"
      >
        {/* Banner Informasi Khusus Admin Rambut */}
        {isAdminRambut && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-amber-300 text-xs leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Akses Terbatas:</span> Sebagai{" "}
              <code className="text-amber-200 bg-amber-500/20 px-1 py-0.5 rounded font-mono">
                admin_rambut
              </code>
              , Anda hanya diperbolehkan menambahkan akun petugas ber-role{" "}
              <span className="font-bold underline">rambut</span>.
            </div>
          </div>
        )}

        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Nama Lengkap
          </label>
          <input
            {...register("name")}
            type="text"
            disabled={isPending}
            className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.name
                ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                : "border-gray-700 focus:ring-2 focus:ring-indigo-500/50"
            }`}
            placeholder="Contoh: muhammad"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Username
          </label>
          <input
            {...register("username")}
            type="text"
            disabled={isPending}
            className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.username
                ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                : "border-gray-700 focus:ring-2 focus:ring-indigo-500/50"
            }`}
            placeholder="@muhammad"
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-400">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Custom Role Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Role
          </label>
          {isAdminRambut ? (
            <div className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800/50 border border-gray-700/80 rounded-xl text-amber-300 text-sm font-mono select-none cursor-not-allowed">
              <span className="capitalize font-bold">rambut (Petugas Layanan)</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                <Lock className="w-3 h-3 text-amber-400" /> Terkunci
              </span>
            </div>
          ) : (
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <div ref={roleDropdownRef} className="relative">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setIsRoleOpen(!isRoleOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 bg-gray-800 border rounded-xl text-white text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.role
                        ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                        : "border-gray-700 focus:ring-2 focus:ring-indigo-500/50 hover:border-gray-600"
                    }`}
                  >
                    <span className="capitalize">{field.value}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isRoleOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isRoleOpen && (
                    <ul className="absolute z-20 mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                      {ROLE_OPTIONS.map((r) => (
                        <li
                          key={r}
                          onClick={() => {
                            field.onChange(r);
                            setIsRoleOpen(false);
                          }}
                          className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                            field.value === r
                              ? "bg-indigo-600/20 text-indigo-400 font-medium"
                              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                          }`}
                        >
                          <span className="capitalize">{r}</span>
                          {field.value === r && (
                            <Check className="w-4 h-4 text-indigo-400" />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            />
          )}
          {errors.role && (
            <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              disabled={isPending}
              className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.password
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                  : "border-gray-700 focus:ring-2 focus:ring-indigo-500/50"
              }`}
              placeholder="Minimal 8 karakter"
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
            <p className="mt-1 text-xs text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Konfirmasi Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <input
              {...register("passwordConfirm")}
              type={showPasswordConfirm ? "text" : "password"}
              disabled={isPending}
              className={`w-full px-4 py-2.5 bg-gray-800 border rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.passwordConfirm
                  ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                  : "border-gray-700 focus:ring-2 focus:ring-indigo-500/50"
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
            <p className="mt-1 text-xs text-red-400">
              {errors.passwordConfirm.message}
            </p>
          )}
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
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
            className="px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>Simpan</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
}