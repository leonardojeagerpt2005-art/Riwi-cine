import React, { useState } from "react";
import { X, Send, Mail, AlertTriangle, CheckCircle2, LifeBuoy } from "lucide-react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function SupportModal({ isOpen, onClose, userEmail = "" }: SupportModalProps) {
  const [email, setEmail] = useState(userEmail);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("Incidencia / Soporte Técnico Cinema Riwi");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      setError("Por favor completa tu correo y la descripción de la queja.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      // Envío real a soporte vía Formspree
      const formspreeRes = await fetch("https://formspree.io/f/xjybyjep", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          subject,
          message,
          _replyto: email,
        }),
      });

      // Registro interno (histórico dentro de la app, no crítico para el envío del correo)
      fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          subject,
          message,
          date: new Date().toISOString(),
        }),
      }).catch(() => {});

      if (formspreeRes.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setMessage("");
          onClose();
        }, 3000);
      } else {
        setError("Error al enviar el reporte. Inténtalo de nuevo.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="liquid-glass w-full max-w-lg rounded-2xl p-6 md:p-8 relative border border-cyan-500/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <LifeBuoy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">Soporte Técnico Cinema Riwi</h3>
            <p className="text-xs text-cyan-300/80">Tu mensaje será enviado a: <span className="font-semibold text-white">yunpapicodsito@gmail.com</span></p>
          </div>
        </div>

        {success ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            <h4 className="text-lg font-semibold text-white">¡Incidencia enviada con éxito!</h4>
            <p className="text-sm text-slate-300 max-w-xs">
              Hemos registrado tu queja y se ha despachado el reporte correctamente a <strong className="text-cyan-300">yunpapicodsito@gmail.com</strong>. Te responderemos pronto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tu Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-cyan-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="liquid-glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Asunto</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="liquid-glass-input w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Descripción de la Queja / Problema</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe detalladamente qué inconveniente tuviste al iniciar sesión, registrarte o realizar una reserva..."
                className="liquid-glass-input w-full px-4 py-3 rounded-xl text-sm resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="water-btn px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <span>Enviar a Soporte</span>
                    <Send className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
