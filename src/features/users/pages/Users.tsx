// src/features/users/pages/Users.tsx
import { useState, useMemo } from "react";
import { useUsers } from "../hooks/useUsers";
import { useToast } from "@/context/ToastContext";
import type { UsersResponse } from "@/types/pocketbase-types";

// Components
import { UsersHeader } from "../components/UsersHeader";
import { UsersStats } from "../components/UsersStats";
import { UsersToolbar } from "../components/UsersToolbar";
import { UsersTable } from "../components/UsersTable";

import CreateUserModal from "../components/CreateUserModal";
import EditUserModal from "../components/EditUserModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import DeleteUserModal from "../components/DeleteUserModal";

import { Loader2, AlertCircle } from "lucide-react";

const UsersPage = () => {
  const { getUsers, createUser, adminUpdateUser, deleteUser, getAvatarUrl, isAdminRambut } = useUsers();
  const { data: users, isLoading, isError, error, refetch } = getUsers;

  const { showSuccess, showError } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(isAdminRambut ? "rambut" : "Semua Role");
  const [statusFilter, setStatusFilter] = useState<string>("Semua Status");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsersResponse | null>(null);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchSearch =
        !searchTerm ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole =
        isAdminRambut ? u.role === "rambut" : roleFilter === "Semua Role" || u.role === roleFilter;

      const matchStatus =
        statusFilter === "Semua Status" ||
        (statusFilter === "Aktif" && u.status) ||
        (statusFilter === "Nonaktif" && !u.status);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter, isAdminRambut]);

  const stats = useMemo(() => {
    if (!users) return { total: 0, active: 0, admin: 0 };
    return {
      total: users.length,
      active: users.filter((u) => u.status).length,
      admin: users.filter((u) => u.role === "admin" || u.role === "admin_rambut").length,
    };
  }, [users]);

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowResetPasswordModal(false);
    setShowDeleteModal(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-gray-300 text-lg font-semibold">Gagal memuat data pengguna.</p>
        <p className="text-gray-500 text-sm mt-1 font-mono">
          {(error as Error)?.message || "Silakan coba lagi."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* 1. Header Hero Banner */}
      <UsersHeader onOpenCreateModal={() => setShowCreateModal(true)} />

      {/* 2. Stat Cards */}
      <UsersStats stats={stats} />

      {/* 3. Search & Filter Toolbar */}
      <UsersToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={isAdminRambut ? "rambut" : roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={refetch}
        isLoading={isLoading}
        isAdminRambut={isAdminRambut}
      />

      {/* 4. Desktop Users Table */}
      <UsersTable
        users={filteredUsers}
        getAvatarUrl={getAvatarUrl}
        onEdit={(u) => {
          setSelectedUser(u);
          setShowEditModal(true);
        }}
        onResetPassword={(u) => {
          setSelectedUser(u);
          setShowResetPasswordModal(true);
        }}
        onDelete={(u) => {
          setSelectedUser(u);
          setShowDeleteModal(true);
        }}
      />

      {/* 5. Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={closeModals}
        onSuccess={(msg) => {
          closeModals();
          showSuccess(msg, "Pengguna Dibuat");
          refetch();
        }}
        onError={(msg) => showError(msg, "Gagal Membuat Pengguna")}
        createUser={createUser}
        isAdminRambut={isAdminRambut}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          user={selectedUser}
          onClose={closeModals}
          onSuccess={(msg) => {
            closeModals();
            showSuccess(msg, "Pengguna Diperbarui");
            refetch();
          }}
          onError={(msg) => showError(msg, "Gagal Perbarui Pengguna")}
          adminUpdateUser={adminUpdateUser}
          getAvatarUrl={getAvatarUrl}
        />
      )}

      {selectedUser && (
        <ResetPasswordModal
          isOpen={showResetPasswordModal}
          user={selectedUser}
          onClose={closeModals}
          onSuccess={(msg) => {
            closeModals();
            showSuccess(msg, "Kata Sandi Direset");
            refetch();
          }}
          onError={(msg) => showError(msg, "Gagal Reset Sandi")}
          adminUpdateUser={adminUpdateUser}
        />
      )}

      {selectedUser && (
        <DeleteUserModal
          isOpen={showDeleteModal}
          user={selectedUser}
          onClose={closeModals}
          onSuccess={(msg) => {
            closeModals();
            showSuccess(msg, "Pengguna Dihapus");
            refetch();
          }}
          onError={(msg) => showError(msg, "Gagal Menghapus")}
          deleteUser={deleteUser}
        />
      )}
    </div>
  );
};

export default UsersPage;