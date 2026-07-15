// src/components/users/CreateUserModal.tsx
import { useState, useEffect, useRef, type FormEvent } from "react";
import { BaseModal } from "../shared/BaseModal"; // ✨ 1. Ganti ModalBackdrop dengan BaseModal
import { ROLE_OPTIONS } from "../../utils/userHelpers";
import type { UsersRoleOptions } from "../../types/pocketbase-types";
import { useUsers } from "../../hooks/useUsers";
import {
  ChevronDown,
  Check,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  AlertCircle,
} from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean; // ✨ 2. Tambahkan prop isOpen
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  createUser: ReturnType<typeof useUsers>["createUser"];
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  createUser,
}: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UsersRoleOptions>("umum");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const isPending = createUser?.isPending ?? false;

  // ✨ 3. Otomatis bersihkan state form setiap kali modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setUsername("");
      setRole("umum");
      setPassword("");
      setPasswordConfirm("");
      setShowPassword(false);
      setLocalError(null);
      setIsRoleOpen(false);
    }
  }, [isOpen]);

  // Tutup dropdown jika klik di luar area menu role
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

  const validate = () => {
    if (!name.trim()) return "Nama lengkap wajib diisi.";
    if (!username.trim()) return "Username wajib diisi.";
    if (password.length < 8) return "Kata sandi minimal 8 karakter.";
    if (password !== passwordConfirm) return "Kata sandi dan konfirmasi tidak cocok.";
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!createUser?.mutate) {
      setLocalError("Fungsi 'createUser' belum siap.");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    createUser.mutate(
      {
        name: name.trim(),
        username: username.trim(),
        email: `${username.trim()}@tibkam.local`, // email otomatis di backend
        role,
        password,
        passwordConfirm,
        status: true, // otomatis aktif saat dibuat
      },
      {
        onSuccess: () => onSuccess("Pengguna baru berhasil ditambahkan."),
        onError: (err) => {
          const msg = err?.message || "Gagal menambahkan pengguna.";
          onError(msg);
          setLocalError(msg);
        },
      }
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
      {/* ✨ Langsung render form tanpa wrapper div / backdrop manual */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            placeholder="Contoh: muhammad"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            placeholder="@muhammad"
          />
        </div>

        {/* Custom Role Dropdown */}
        <div ref={roleDropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Role
          </label>
          <button
            type="button"
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:border-gray-600 transition-colors"
          >
            <span className="capitalize">{role}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isRoleOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isRoleOpen && (
            <ul className="absolute z-20 mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
              {ROLE_OPTIONS.map((r) => (
                <li
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setIsRoleOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    role === r
                      ? "bg-indigo-600/20 text-indigo-400 font-medium"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <span className="capitalize">{r}</span>
                  {role === r && <Check className="w-4 h-4 text-indigo-400" />}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="Minimal 8 karakter"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Konfirmasi Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Konfirmasi Kata Sandi
          </label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            placeholder="Ulangi kata sandi"
          />
        </div>

        {localError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-gray-800 transition-colors"
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