// src/features/rambut/components/ManagePengurusModal.tsx
import React, { useState } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { pb } from "@/lib/pocketbase";
import { useToast } from "@/context/ToastContext";
import { UserCheck, Plus, Loader2 } from "lucide-react";

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
      icon={<UserCheck className="w-4 h-4 text-indigo-400" />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleAddPengurus} className="space-y-3 pt-1 font-sans">
        <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
          Santri non-Aliyah/Kuliah Syariah yang terdaftar di sini otomatis dimasukkan ke daftar Wajib Setor.
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">ID PPS Santri</label>
          <input
            type="text"
            value={idPpsInput}
            onChange={(e) => setIdPpsInput(e.target.value)}
            placeholder="Ketik / Scan ID PPS..."
            className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Jabatan / Tugas</label>
          <input
            type="text"
            value={jabatanInput}
            onChange={(e) => setJabatanInput(e.target.value)}
            placeholder="Contoh: Pengurus Daerah B / Petugas Kamar"
            className="w-full h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-medium transition-colors"
          >
            Tutup
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Tambah Pengurus</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
};