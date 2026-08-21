import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Film, Mail, Lock, User, ArrowRight, LifeBuoy, AlertCircle } from "lucide-react";
import { VideoBackground } from "../components/VideoBackground";
import { SupportModal } from "../components/SupportModal";

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const checkRes = await fetch("/api/users");
      const users = await checkRes.json();
      const existing = users.find((u: any) => u.email === email);

      if (existing) {
        setError("Este correo ya está registrado. Por favor inicia sesión.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Error al registrar usuario.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-black tracking-wider text-white">REGISTRO RIWI</h1>
          <p className="text-xs text-cyan-300/80 mt-1">Crea tu cuenta y vive el cine al máximo nivel</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-emerald-200" />
            <span>Usuario creado. Inicia sesión para continuar.</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Nombre Completo</label>
            <div className="relative">
              <User className="icon-float icon-float-delay-1 absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu Nombre"
                className="liquid-glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="icon-float icon-float-delay-2 absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="icon-float icon-float-delay-3 absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
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
            disabled={loading || success}
            className="water-btn w-full py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 mt-2 shadow-lg"
          >
            <span>{loading ? "Registrando..." : success ? "Cuenta creada" : "Crear Cuenta"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-xs text-slate-400">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
          {success && (
            <p className="text-xs text-emerald-200">Tu cuenta ha sido creada correctamente. Ve al login.</p>
          )}

          <button
            onClick={() => setIsSupportOpen(true)}
            className="text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center space-x-1.5 mx-auto pt-2 border-t border-white/10 w-full"
          >
            <LifeBuoy className="icon-float w-3.5 h-3.5 text-cyan-400" />
            <span>¿Problemas en el registro? Soporte Técnico</span>
          </button>
        </div>
      </div>

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} userEmail={email} />
    </div>
  );
}
