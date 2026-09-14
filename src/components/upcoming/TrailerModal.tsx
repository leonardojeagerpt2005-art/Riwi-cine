import React, { useEffect } from "react";
import { Link } from "react-router";
import { X, Film, Sparkles, ArrowRight } from "lucide-react";
import type { UpcomingMovie } from "./interface";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: UpcomingMovie | null;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  movie,
}) => {
  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="liquid-glass w-full max-w-4xl rounded-3xl border border-cyan-500/40 shadow-[0_0_50px_rgba(14,165,233,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center space-x-3 pr-4 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Trailer Oficial</span>
              </div>
              <h3 className="font-bold text-white text-base sm:text-lg truncate">
                {movie.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 border border-white/10 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Cerrar trailer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reproductor de YouTube Embebido (16:9) */}
        <div className="p-3 sm:p-4 bg-black/50">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-white/5">
            <iframe
              className="absolute top-0 left-0 w-full h-full border-0"
              src={`https://www.youtube-nocookie.com/embed/${movie.trailerYoutubeId}?autoplay=1&rel=0`}
              title={`Trailer oficial de ${movie.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="bg-[#16a34a] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <Link
              to={`/proximos-estrenos/${movie.id}`}
              onClick={onClose}
              className="water-btn px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
            >
              <span>Ver ficha completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
