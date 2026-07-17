// src/components/rambut/ManagePengurusModal.tsx
import React, { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { pb } from "@/lib/pocketbase";
import { useToast } from "@/context/ToastContext";
import { UserCheck, Plus, Loader2, Trash2 } from "lucide-react";

interface ManagePengurusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManagePengurusModal: React.FC<ManagePengurusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showSuccess, showError } = useToast();
  const [idPpsInput, setIdPpsInput] = useState("");
  const [jabatanInput, setJabatanInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPengurus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPpsInput) return;

    setIsSubmitting(true);
    try {
      const santri = await pb.collection("master").getFirstListItem(`id_pps = "${idPpsInput.trim()}"`);
      
      await pb.collection("pengurus_santri").create({
        santri: santri.id,
        id_pps: santri.id_pps,
        jabatan: jabatanInput || "Pengurus/Petugas",
        status_aktif: true,
      });

      showSuccess(`Berhasil mendaftarkan ${santri.nama} sebagai pengurus.`, "Pengurus Ditambahkan");
      setIdPpsInput("");
      setJabatanInput("");
    } catch {
      showError("ID PPS tidak ditemukan atau gagal menyimpan data pengurus.", "Terjadi Kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Registrasi Pengurus / Petugas"
      icon={<UserCheck className="w-5 h-5 text-indigo-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleAddPengurus} className="space-y-4 pt-1">
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
          Santri non-Aliyah/Kuliah Syariah yang terdaftar di sini otomatis dimasukkan ke daftar Wajib Setor.
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
            ID PPS Santri
          </label>
          <input
            type="text"
            value={idPpsInput}
            onChange={(e) => setIdPpsInput(e.target.value)}
            placeholder="Ketik / Scan ID PPS..."
            className="w-full px-3.5 py-2.5 bg-gray-950/60 border border-gray-800 rounded-2xl text-white font-mono text-xs"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
            Jabatan / Tugas
          </label>
          <input
            type="text"
            value={jabatanInput}
            onChange={(e) => setJabatanInput(e.target.value)}
            placeholder="Contoh: Pengurus Daerah B / Petugas Kamar"
            className="w-full px-3.5 py-2.5 bg-gray-950/60 border border-gray-800 rounded-2xl text-white font-mono text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-gray-800 bg-gray-900/80 text-gray-300 text-xs font-mono font-semibold"
          >
            Tutup
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-mono text-xs font-semibold rounded-2xl"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Tambah Pengurus</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
};