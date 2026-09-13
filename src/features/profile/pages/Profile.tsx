// src/features/profile/pages/Profile.tsx
import { useState } from "react";
import { useAuth } from "@/features/auth";
import { useToast } from "@/context/ToastContext";
import type { UsersResponse } from "@/types/pocketbase-types";

// Components
import { ProfileHeroHeader } from "../components/ProfileHeroHeader";
import { ProfileSummaryCard } from "../components/ProfileSummaryCard";
import { EditProfileModal } from "../components/EditProfileModal";
import { ChangePasswordModal } from "../components/ChangePasswordModal";

const Profile = () => {
  const { user } = useAuth();
  const currentUser = user as UsersResponse | null;

  const { showSuccess, showError } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="bg-zinc-950 min-h-screen p-4 sm:p-5 lg:p-6 space-y-4 font-sans w-full">
      {/* 1. Hero Header Shared */}
      <ProfileHeroHeader />

      {/* 2. Full Profile Summary Card */}
      <ProfileSummaryCard
        user={currentUser}
        onOpenEditModal={() => setIsEditModalOpen(true)}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
      />

      {/* 3. Modals */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={currentUser}
        onSuccess={(msg) => showSuccess(msg)}
        onError={(msg) => showError(msg)}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userId={currentUser?.id ?? ""}
        onSuccess={(msg) => showSuccess(msg, "Kata Sandi Diubah")}
        onError={(msg) => showError(msg, "Gagal Ubah Sandi")}
      />
    </div>
  );
};

export default Profile;