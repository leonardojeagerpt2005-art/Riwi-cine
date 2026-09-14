import React, { useState } from "react";
import { useNavigate } from "react-router";
import type { UpcomingMovie } from "./interface";
import { TrailerModal } from "./TrailerModal";

interface UpcomingCardProps {
  movie: UpcomingMovie;
  onWatchTrailer?: (movie: UpcomingMovie) => void;
}

export const UpcomingCard: React.FC<UpcomingCardProps> = ({
  movie,
  onWatchTrailer,
}) => {
  const navigate = useNavigate();
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  // Navegación a la página de detalles al hacer click en la card
  const handleCardClick = () => {
    navigate(`/proximos-estrenos/${movie.id}`);
  };

  // Apertura del modal al hacer click en "Ver trailer"
  const handleTrailerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita navegar a la página de detalles
    if (onWatchTrailer) {
      onWatchTrailer(movie);
    } else {
      setIsTrailerModalOpen(true);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="liquid-glass rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(14,165,233,0.25)] transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1.5 group"
      >
        {/* Poster superior de ancho completo */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950/80">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Contenido inferior de la card */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3.5">
          {/* Título de la película */}
          <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {movie.title}
          </h3>

          {/* Badges de géneros */}
          <div className="flex flex-wrap gap-1.5">
            {movie.genres.map((genre) => (
              <span
                key={genre}
                className="inline-block bg-[#16a34a] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Botón Ver trailer (Abre el modal sin salir de la página) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTrailerClick}
              className="inline-flex items-center gap-2 bg-[#0c376d] hover:bg-cyan-600 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md border border-cyan-500/30 cursor-pointer"
            >
              <svg
                className="w-4 h-4 fill-current text-white shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>Ver trailer</span>
            </button>
          </div>

          {/* Sección Fecha de estreno centrada */}
          <div className="flex flex-col items-center justify-center pt-3 mt-auto text-center border-t border-white/10">
            <span className="text-xs font-medium text-slate-400">Fecha de estreno:</span>
            <span className="text-sm font-semibold text-white tracking-wide mt-0.5">
              {movie.releaseDate}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de trailer para esta card */}
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        movie={movie}
      />
    </>
  );
};
