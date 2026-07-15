// src/pages/Login.tsx
import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  // --- Router ---
  const navigate = useNavigate();
  const location = useLocation();

  // --- Auth Hook ---
  const { login, isLoading, isValid } = useAuth();

  // --- Form State ---
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Derive redirect destination ---
  const from = (location.state as { from?: string })?.from || '/dashboard';

  // --- Auto-redirect if already authenticated ---
  useEffect(() => {
    if (isValid) {
      navigate(from, { replace: true });
    }
  }, [isValid, navigate, from]);

  // --- Submit Handler ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = await login(username, password);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.error ?? 'Terjadi kesalahan kredensial. Silakan coba lagi.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gray-950 p-4 sm:p-6 overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 🔮 Ambient Glow Mesh Background */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* 🚀 Glassmorphic Card Container */}
      <div className="relative w-full max-w-md z-10">
        <div className="relative overflow-hidden rounded-3xl border border-gray-800/80 bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-gray-950/90 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
          {/* 🔮 Garis Aksen Top Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Header Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white font-mono">
              TIBKAM<span className="text-indigo-400">1745</span>
            </h1>
            
            <p className="mt-1.5 text-xs font-mono text-gray-400 leading-relaxed">
              Masuk ke portal otentikasi & sistem terpadu
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              className="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 animate-in fade-in slide-in-from-top-2 duration-300"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
              <p className="text-xs font-mono leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Field Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-mono font-medium text-gray-300 mb-1.5"
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
                className="block text-xs font-mono font-medium text-gray-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
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
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Submit Bergradien */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono font-semibold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all duration-200 active:scale-95 mt-2"
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
          <div className="mt-8 pt-5 border-t border-gray-800/80 flex items-center justify-center gap-1.5 text-[11px] font-mono text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Otentikasi Enkripsi PocketBase Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;