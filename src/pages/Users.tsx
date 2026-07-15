// src/pages/Users.tsx
import { useState, useMemo } from "react";
import { useUsers } from "../hooks/useUsers";
import { useToast } from "../context/ToastContext"; // ✨ Toast Context Global
import type { UsersResponse } from "../types/pocketbase-types";

// Components
import { UsersHeader } from "../components/users/UsersHeader";
import { UsersStats } from "../components/users/UsersStats";
import { UsersToolbar } from "../components/users/UsersToolbar";
import { UsersTable } from "../components/users/UsersTable";

// Modals
import CreateUserModal from "../components/users/CreateUserModal";
import EditUserModal from "../components/users/EditUserModal";
import ResetPasswordModal from "../components/users/ResetPasswordModal";
import DeleteUserModal from "../components/users/DeleteUserModal";

import { Loader2, AlertCircle } from "lucide-react";

const UsersPage = () => {
  const { getUsers, createUser, adminUpdateUser, deleteUser, getAvatarUrl } = useUsers();
  const { data: users, isLoading, isError, error } = getUsers;

  // ✨ Global Toast Trigger
  const { showSuccess, showError } = useToast();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Semua Role");
  const [statusFilter, setStatusFilter] = useState<string>("Semua Status");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsersResponse | null>(null);

  // Filtered Users Logic
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((u) => {
      const matchSearch =
        !searchTerm ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === "Semua Role" || u.role === roleFilter;

      const matchStatus =
        statusFilter === "Semua Status" ||
        (statusFilter === "Aktif" && u.status) ||
        (statusFilter === "Nonaktif" && !u.status);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    if (!users) return { total: 0, active: 0, admin: 0 };
    return {
      total: users.length,
      active: users.filter((u) => u.status).length,
      admin: users.filter((u) => u.role === "admin").length,
    };
  }, [users]);

  // Modal Handlers
  // ✨ PERBAIKAN: Hapus setSelectedUser(null) dari closeModals.
  // Biarkan selectedUser tetap berisi data user terakhir agar animasi penutupan modal berjalan sempurna!
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
        <p className="text-gray-300 text-lg">Gagal memuat data pengguna.</p>
        <p className="text-gray-500 text-sm mt-1">
          {(error as Error)?.message || "Silakan coba lagi."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* 1. Header Hero Banner */}
      <UsersHeader onOpenCreateModal={() => setShowCreateModal(true)} />

      {/* 2. Stat Cards */}
      <UsersStats stats={stats} />

      {/* 3. Search & Filter Toolbar */}
      <UsersToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
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

      {/* ════════ 5. MODALS WITH SMOOTH EXIT TRANSITION ════════ */}

      {/* Modal 1: Create User */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={closeModals}
        onSuccess={(msg) => {
          closeModals();
          showSuccess(msg, "Pengguna Dibuat");
          getUsers.refetch();
        }}
        onError={(msg) => showError(msg, "Gagal Membuat Pengguna")}
        createUser={createUser}
      />

      {/* Modal 2: Edit User */}
      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          user={selectedUser}
          onClose={closeModals}
          onSuccess={(msg) => {
            closeModals();
            showSuccess(msg, "Pengguna Diperbarui");
            getUsers.refetch();
          }}
          onError={(msg) => showError(msg, "Gagal Perbarui Pengguna")}
          adminUpdateUser={adminUpdateUser}
          getAvatarUrl={getAvatarUrl}
        />
      )}

      {/* Modal 3: Reset Password */}
      {selectedUser && (
        <ResetPasswordModal
          isOpen={showResetPasswordModal}
          user={selectedUser}
          onClose={closeModals}
          onSuccess={(msg) => {
            closeModals();
            showSuccess(msg, "Kata Sandi Direset");
            getUsers.refetch();
          }}
          onError={(msg) => showError(msg, "Gagal Reset Sandi")}
          adminUpdateUser={adminUpdateUser}
        />
      )}

      {/* Modal 4: Delete User */}
      {selectedUser && (
        <DeleteUserModal
          isOpen={showDeleteModal}
          user={selectedUser}
          onClose={closeModals}
          onSuccess={(msg) => {
            closeModals();
            showSuccess(msg, "Pengguna Dihapus");
            getUsers.refetch();
          }}
          onError={(msg) => showError(msg, "Gagal Menghapus")}
          deleteUser={deleteUser}
        />
      )}
    </div>
  );
};

export default UsersPage;