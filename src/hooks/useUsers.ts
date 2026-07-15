import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../services/pocketbase";
import { ClientResponseError } from "pocketbase";
import type { UsersResponse, UsersRoleOptions } from "../types/pocketbase-types";

// ----------------------------------------------------------------------
// Payload Interfaces
// ----------------------------------------------------------------------

/** Payload untuk self-update (Profil Saya), memerlukan oldPassword */
export interface UpdateUserData {
  id: string;
  name?: string;
  avatarFile?: File | null;
  removeAvatar?: boolean;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
}

/** Payload untuk membuat pengguna baru (Admin) */
export interface CreateUserData {
  username: string;
  email: string;
  name: string;
  role: UsersRoleOptions;
  password: string;
  passwordConfirm: string;
  status?: boolean;
  avatarFile?: File | null;
}

/** Payload untuk pembaruan pengguna oleh Admin */
export interface AdminUpdateUserData {
  id: string;
  name?: string;
  role?: UsersRoleOptions;
  status?: boolean;
  password?: string;
  passwordConfirm?: string;
  avatarFile?: File | null;
  removeAvatar?: boolean;
}

// ----------------------------------------------------------------------
// Helper: Avatar URL
// ----------------------------------------------------------------------

/**
 * Membantu menghasilkan URL avatar penuh dari record pengguna.
 * Mengembalikan `null` jika pengguna atau avatar tidak tersedia.
 */
export function getAvatarUrl(user: UsersResponse | null): string | null {
  if (!user || !user.avatar) return null;
  return pb.files.getURL(user, user.avatar);
}

// ----------------------------------------------------------------------
// Error Parsing
// ----------------------------------------------------------------------

/**
 * Mengurai error dari PocketBase (ClientResponseError) atau Error biasa
 * menjadi pesan berbahasa Indonesia yang ramah pengguna.
 */
function parsePocketBaseError(error: unknown): string {
  if (error instanceof ClientResponseError) {
    const data = error.response?.data ?? {};

    if (data.oldPassword?.message) {
      return "Kata sandi lama yang Anda masukkan salah.";
    }
    if (data.password?.message) {
      return "Format kata sandi baru tidak memenuhi syarat.";
    }
    if (data.avatar?.message) {
      return "Ukuran atau format file foto profil tidak didukung.";
    }
    if (data.username?.message) {
      return data.username.message;
    }
    if (data.email?.message) {
      return data.email.message;
    }
    if (data.role?.message) {
      return data.role.message;
    }
    if (error.status === 401) {
      return "Sesi Anda telah berakhir, silakan login kembali.";
    }
    if (error.response?.message) {
      return error.response.message;
    }
    return error.message || "Terjadi kesalahan pada server.";
  }

  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan yang tidak diketahui.";
}

// ----------------------------------------------------------------------
// Mutation: Self Update (Profil Saya)
// ----------------------------------------------------------------------

/**
 * Custom hook untuk memperbarui data pengguna (self‑update).
 * Memerlukan oldPassword jika mengganti password.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<UsersResponse, Error, UpdateUserData>({
    mutationFn: async (payload) => {
      try {
        const {
          id,
          name,
          avatarFile,
          removeAvatar,
          oldPassword,
          password,
          passwordConfirm,
        } = payload;

        const formData = new FormData();

        if (name !== undefined) {
          formData.append("name", name);
        }

        if (removeAvatar) {
          formData.append("avatar", "");
        } else if (avatarFile) {
          formData.append("avatar", avatarFile);
        }

        if (password) {
          if (oldPassword) {
            formData.append("oldPassword", oldPassword);
          }
          formData.append("password", password);
          formData.append("passwordConfirm", passwordConfirm ?? password);
        }

        const updatedUser = await pb
          .collection("users")
          .update<UsersResponse>(id, formData);

        // Refresh sesi lokal jika yang diperbarui adalah pengguna yang sedang login
        if (pb.authStore.model?.id === id) {
          if (password) {
            const identity =
              pb.authStore.model.email || pb.authStore.model.username;
            if (identity) {
              await pb.collection("users").authWithPassword(identity, password);
            }
          } else {
            await pb.collection("users").authRefresh();
          }
        }

        return updatedUser;
      } catch (error) {
        throw new Error(parsePocketBaseError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ----------------------------------------------------------------------
// Mutation: Admin Create User
// ----------------------------------------------------------------------

/**
 * Hook untuk Admin membuat pengguna baru.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<UsersResponse, Error, CreateUserData>({
    mutationFn: async (data) => {
      try {
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("name", data.name);
        formData.append("role", data.role);
        formData.append("password", data.password);
        formData.append("passwordConfirm", data.passwordConfirm);

        if (data.status !== undefined) {
          formData.append("status", String(data.status));
        }
        if (data.avatarFile) {
          formData.append("avatar", data.avatarFile);
        }

        return await pb.collection("users").create<UsersResponse>(formData);
      } catch (error) {
        throw new Error(parsePocketBaseError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ----------------------------------------------------------------------
// Mutation: Admin Update User
// ----------------------------------------------------------------------

/**
 * Hook untuk Admin memperbarui pengguna (tanpa oldPassword).
 */
export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<UsersResponse, Error, AdminUpdateUserData>({
    mutationFn: async (payload) => {
      try {
        const {
          id,
          name,
          role,
          status,
          password,
          passwordConfirm,
          avatarFile,
          removeAvatar,
        } = payload;

        const formData = new FormData();

        if (name !== undefined) {
          formData.append("name", name);
        }
        if (role !== undefined) {
          formData.append("role", role);
        }
        if (status !== undefined) {
          formData.append("status", String(status));
        }

        if (removeAvatar) {
          formData.append("avatar", "");
        } else if (avatarFile) {
          formData.append("avatar", avatarFile);
        }

        if (password) {
          formData.append("password", password);
          formData.append("passwordConfirm", passwordConfirm ?? password);
        }

        const updatedUser = await pb
          .collection("users")
          .update<UsersResponse>(id, formData);

        // Jaga sesi jika admin mengubah akunnya sendiri
        if (pb.authStore.model?.id === id) {
          if (password) {
            const identity =
              pb.authStore.model.email || pb.authStore.model.username;
            if (identity) {
              await pb.collection("users").authWithPassword(identity, password);
            }
          } else {
            await pb.collection("users").authRefresh();
          }
        }

        return updatedUser;
      } catch (error) {
        throw new Error(parsePocketBaseError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ----------------------------------------------------------------------
// Mutation: Admin Delete User
// ----------------------------------------------------------------------

/**
 * Hook untuk Admin menghapus pengguna berdasarkan ID.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      try {
        await pb.collection("users").delete(id);
      } catch (error) {
        throw new Error(parsePocketBaseError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// ----------------------------------------------------------------------
// Query: Get All Users
// ----------------------------------------------------------------------

/**
 * Custom hook untuk mengambil daftar semua pengguna.
 * Menerima opsi `enabled` untuk mengaktifkan/menonaktifkan query.
 */
export function useGetUsers(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;

  return useQuery<UsersResponse[]>({
    queryKey: ["users"],
    queryFn: () =>
      pb.collection("users").getFullList<UsersResponse>({
        sort: "-created",
      }),
    enabled,
  });
}

// ----------------------------------------------------------------------
// Composite Hook
// ----------------------------------------------------------------------

/**
 * Hook komposit yang menggabungkan seluruh operasi terkait `users`.
 * Mengembalikan helper avatar, query daftar pengguna, dan semua mutasi.
 */
export function useUsers() {
  const getUsers = useGetUsers();
  const updateUser = useUpdateUser();
  const createUser = useCreateUser();
  const adminUpdateUser = useAdminUpdateUser();
  const deleteUser = useDeleteUser();

  return {
    /** Fungsi untuk mendapatkan URL avatar pengguna */
    getAvatarUrl,
    /** Query daftar semua pengguna */
    getUsers,
    /** Mutasi untuk self‑update profil (memerlukan oldPassword) */
    updateUser,
    /** Mutasi untuk Admin membuat pengguna baru */
    createUser,
    /** Mutasi untuk Admin memperbarui pengguna (tanpa oldPassword) */
    adminUpdateUser,
    /** Mutasi untuk Admin menghapus pengguna */
    deleteUser,
  };
}