import React from "react";
import { UpcomingCard } from "./UpcomingCard";
import type { UpcomingMovie } from "./interface";

interface UpcomingListProps {
  movies: UpcomingMovie[];
  loading?: boolean;
  error?: string | null;
}

export const UpcomingList: React.FC<UpcomingListProps> = ({
  movies,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white/10 rounded-2xl h-96 w-full backdrop-blur-md border border-white/10"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="liquid-glass rounded-2xl p-8 text-center max-w-lg mx-auto border border-rose-500/30">
        <p className="text-rose-300 font-semibold mb-2">{error}</p>
        <p className="text-xs text-slate-400">Por favor, intenta recargar la página.</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="liquid-glass rounded-2xl p-8 text-center max-w-lg mx-auto border border-white/10">
        <p className="text-slate-200 font-semibold mb-1">No se encontraron películas</p>
        <p className="text-xs text-slate-400">Intenta con otro género o criterio de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
      {movies.map((movie) => (
        <UpcomingCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};
