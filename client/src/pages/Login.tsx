import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Film, Mail, Lock, ArrowRight, LifeBuoy, AlertCircle, Sparkles } from "lucide-react";
import { SupportModal } from "../components/SupportModal";
import { VideoBackground } from "../components/VideoBackground";
import { LocationModal } from "../components/location/LocationModal";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/users");
      const users = await res.json();
      
      const found = users.find((u: any) => u.email === email && u.password === password);
      if (found) {
        localStorage.setItem("cinema_user", JSON.stringify(found));
        setIsLocationOpen(true);
      } else {
        setError("Credenciales incorrectas. Verifica tu correo o contraseña.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClose = () => {
    setIsLocationOpen(false);
    setLocation("/cinema");
  };

  const handleDemoLogin = () => {
    setEmail("demo@riwicinema.com");
    setPassword("123");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <VideoBackground />

      <div className="liquid-glass w-full max-w-md rounded-3xl p-8 relative z-10 border border-cyan-500/30 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="icon-float w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(14,165,233,0.4)]">
            <Film className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">CINEMA RIWI</h1>
          <p className="text-xs text-cyan-300/80 mt-1">Sumérgete en la experiencia cinematográfica líquida</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="icon-float icon-float-delay-1 absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="liquid-glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">Contraseña</label>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Usar Demo (123)</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="icon-float icon-float-delay-2 absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="liquid-glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="water-btn w-full py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 mt-2 shadow-lg"
          >
            <span>{loading ? "Iniciando..." : "Iniciar Sesión"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-xs text-slate-400">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-cyan-400 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>

          <button
            onClick={() => setIsSupportOpen(true)}
            className="text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center space-x-1.5 mx-auto pt-2 border-t border-white/10 w-full"
          >
            <LifeBuoy className="icon-float w-3.5 h-3.5 text-cyan-400" />
            <span>¿Problemas para acceder? Soporte Técnico</span>
          </button>
        </div>
      </div>

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} userEmail={email} />
      <LocationModal isOpen={isLocationOpen} onClose={handleLocationClose} />
    </div>
  );
}