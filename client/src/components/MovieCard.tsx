import React, { useEffect, useState } from "react";
import { Star, Clock, Ticket, Film } from "lucide-react";
import type { Currency } from "./location/currencies";
import { formatPrice } from "./location/currencies";

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: string;
  rating: string;
  poster: string;
  video?: string;
  synopsis: string;
  showtimes: string[];
  price: number;
}

interface MovieCardProps {
  movie: Movie;
  currency: Currency;
  onSelect: (movie: Movie) => void;
  selectLabel?: string;
}

export function MovieCard({ movie, currency, onSelect, selectLabel = "Seleccionar y Reservar" }: MovieCardProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [movie.video]);

  return (
    <div className="liquid-glass rounded-2xl overflow-hidden group hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 flex flex-col h-full">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {movie.video && !videoFailed && (
          <video
            src={movie.video}
            poster={movie.poster}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060913] via-transparent to-transparent opacity-80" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center space-x-1 text-xs font-bold text-amber-400">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{movie.rating}</span>
        </div>

        {/* Genre Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 text-[10px] font-semibold text-cyan-300">
          {movie.genre.split("/")[0]}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {movie.synopsis}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center space-x-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{movie.duration}</span>
            </span>
            <span className="font-bold text-cyan-400 text-sm">{formatPrice(movie.price, currency)}</span>
          </div>

          <button
            onClick={() => onSelect(movie)}
            className="water-btn w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2"
          >
            <Ticket className="w-4 h-4" />
            <span>{selectLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
