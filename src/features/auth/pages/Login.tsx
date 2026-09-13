// src/features/auth/pages/Login.tsx
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, isValid } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Auto-redirect jika sudah terotentikasi
  useEffect(() => {
    if (isValid) {
      navigate("/dashboard", { replace: true });
    }
  }, [isValid, navigate]);

  // Auto-focus input username saat pertama dibuka
  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  // Hapus pesan error secara otomatis saat user mulai mengetik ulang
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (errorMessage) setErrorMessage("");
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setErrorMessage("Silakan isi username dan kata sandi.");
      return;
    }

    const res = await login(username, password);

    if (res.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setErrorMessage(res.error ?? "Gagal masuk ke sistem.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 font-sans select-none">
      <div className="w-full max-w-sm">
        {/* Card Login Bersih & Rapi (Zinc-900, Border-Zinc-800, Rounded-XL) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
          {/* Header Branding */}
          <div className="text-center mb-5 flex flex-col items-center">
            <img
              src="/logo_tibkam_sayap_saja.svg"
              alt="Logo Tibkam"
              className="h-10 w-auto mb-2.5 object-contain pointer-events-none"
            />
            <h1 className="text-base font-bold text-zinc-100 tracking-wide font-mono">
              TIBKAM<span className="text-indigo-400">1745</span>
            </h1>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Portal Otentikasi Layanan Terpadu
            </p>
          </div>

          {/* Smooth Accordion Error */}
          <AnimatePresence initial={false}>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Field Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-medium text-zinc-300 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  ref={usernameInputRef}
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  disabled={isLoading}
                  className={`w-full h-9 pl-9 pr-3 bg-zinc-950 border rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 ${
                    errorMessage
                      ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                      : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
              </div>
            </div>

            {/* Field Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-medium text-zinc-300 mb-1"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`w-full h-9 pl-9 pr-9 bg-zinc-950 border rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 ${
                    errorMessage
                      ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
                      : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                />
                {/* 
                  🛡️ tabIndex={-1} ditambahkan di sini agar fokus Tab langsung lompat 
                  ke tombol "Masuk Sistem" tanpa tersangkut di ikon mata
                */}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Submit (Fokus Tab langsung mendarat di sini) */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 mt-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors active:scale-98 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sistem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Status */}
          <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-center gap-1.5 text-[10px] font-sans text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sesi offline terenkripsi lokal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;