// src/hooks/useUsers.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pb } from "../services/pocketbase";
import { parsePocketBaseError } from "../utils/errorHandler"; // ✅ KUNCI SINKRONISASI
import type { UsersResponse, UsersRoleOptions } from "../types/pocketbase-types";

export interface UpdateUserData {
  id: string;
  name?: string;
  avatarFile?: File | null;
  removeAvatar?: boolean;
  oldPassword?: string;
  password?: string;
  passwordConfirm?: string;
}

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

export function getAvatarUrl(user: UsersResponse | null): string | null {
  if (!user || !user.avatar) return null;
  return pb.files.getURL(user, user.avatar);
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<UsersResponse, Error, UpdateUserData>({
    mutationFn: async (payload) => {
      try {
        const { id, name, avatarFile, removeAvatar, oldPassword, password, passwordConfirm } = payload;
        const formData = new FormData();

        if (name !== undefined) formData.append("name", name);
        if (removeAvatar) {
          formData.append("avatar", "");
        } else if (avatarFile) {
          formData.append("avatar", avatarFile);
        }

        if (password) {
          if (oldPassword) formData.append("oldPassword", oldPassword);
          formData.append("password", password);
          formData.append("passwordConfirm", passwordConfirm ?? password);
        }

        const updatedUser = await pb.collection("users").update<UsersResponse>(id, formData);

        if (pb.authStore.model?.id === id) {
          if (password) {
            const identity = pb.authStore.model.email || pb.authStore.model.username;
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

        if (data.status !== undefined) formData.append("status", String(data.status));
        if (data.avatarFile) formData.append("avatar", data.avatarFile);

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

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<UsersResponse, Error, AdminUpdateUserData>({
    mutationFn: async (payload) => {
      try {
        const { id, name, role, status, password, passwordConfirm, avatarFile, removeAvatar } = payload;
        const formData = new FormData();

        if (name !== undefined) formData.append("name", name);
        if (role !== undefined) formData.append("role", role);
        if (status !== undefined) formData.append("status", String(status));

        if (removeAvatar) {
          formData.append("avatar", "");
        } else if (avatarFile) {
          formData.append("avatar", avatarFile);
        }

        if (password) {
          formData.append("password", password);
          formData.append("passwordConfirm", passwordConfirm ?? password);
        }

        const updatedUser = await pb.collection("users").update<UsersResponse>(id, formData);

        if (pb.authStore.model?.id === id) {
          if (password) {
            const identity = pb.authStore.model.email || pb.authStore.model.username;
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

export function useGetUsers(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;

  return useQuery<UsersResponse[]>({
    queryKey: ["users"],
    queryFn: () => pb.collection("users").getFullList<UsersResponse>({ sort: "-created" }),
    enabled,
  });
}

export function useUsers() {
  const getUsers = useGetUsers();
  const updateUser = useUpdateUser();
  const createUser = useCreateUser();
  const adminUpdateUser = useAdminUpdateUser();
  const deleteUser = useDeleteUser();

  return { getAvatarUrl, getUsers, updateUser, createUser, adminUpdateUser, deleteUser };
}