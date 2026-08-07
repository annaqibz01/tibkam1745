// src/features/auth/pages/Login.tsx
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/context/ToastContext";

const Login = () => {
  // --- Router ---
  const navigate = useNavigate();

  // --- Auth & Toast Hooks ---
  const { login, isLoading, isValid } = useAuth();
  const { showError } = useToast();

  // --- Form State ---
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // --- Auto-redirect if already authenticated ---
  useEffect(() => {
    if (isValid) {
      navigate("/dashboard", { replace: true });
    }
  }, [isValid, navigate]);

  // --- Submit Handler ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await login(username, password);

    if (res.success) {
      navigate("/dashboard", { replace: true });
    } else {
      showError(
        res.error ?? "Terjadi kesalahan kredensial. Silakan coba lagi.",
        "Otentikasi Gagal"
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-950 p-4 sm:p-6 overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 🔮 Ambient Glow Mesh Background */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* 🚀 Glassmorphic Card Container */}
      <div className="relative w-full max-w-md z-10">
        <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300">
          {/* 🔮 Garis Aksen Top Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Header Branding */}
          <div className="text-center mb-6 flex flex-col items-center justify-center">
            {/* 🎯 Logo SVG Diperbesar (w-56 h-56) & Diberi Negative Margin untuk Memotong Spasi Kosong */}
            <div className="inline-flex items-center justify-center -mb-6">
              <img
                src="/logo_tibkam_1745.svg"
                alt="Logo TIBKAM 1745"
                draggable="false"
                className="w-60 h-50 object-contain"
                loading="eager"
              />
            </div>

            <p className="select-none text-sm font-mono text-gray-400 tracking-wide">
              Portal Otentikasi & Sistem Terpadu
            </p>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Field Username */}
            <div>
              <label
                htmlFor="username"
                className="select-none block text-xs font-mono font-medium text-gray-300 mb-1.5"
              >
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  required
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3 bg-gray-950/60 border border-gray-800/80 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 shadow-inner transition-all duration-200"
                />
              </div>
            </div>

            {/* Field Password dengan Fitur Toggle Eye */}
            <div>
              <label
                htmlFor="password"
                className="select-none block text-xs font-mono font-medium text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-11 py-3 bg-gray-950/60 border border-gray-800/80 rounded-2xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 shadow-inner transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                  title={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 🎯 Tombol Submit Bergradien */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono font-semibold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all duration-200 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Sesi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sistem</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="select-none mt-6 pt-4 border-t border-gray-800/80 flex items-center justify-center gap-1.5 text-[11px] font-mono text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Otentikasi Enkripsi Terproteksi Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;