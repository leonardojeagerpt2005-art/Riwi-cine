import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Users,
  Film,
  Sparkles,
  AlertCircle,
  Clock,
} from "lucide-react";
import { VideoBackground } from "../components/VideoBackground";
import { useUpcomingMovies } from "../components/upcoming/useUpcomingMovies";

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getMovieById, loading } = useUpcomingMovies();

  const movie = id ? getMovieById(id) : undefined;

  // Estado de carga inicial
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <VideoBackground />
        <div className="liquid-glass rounded-3xl p-8 text-center max-w-md w-full relative z-10 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 mx-auto mb-4" />
          <div className="h-6 bg-white/20 rounded w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  // Estado si no se encuentra la película
  if (!movie) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <VideoBackground />
        <div className="liquid-glass rounded-3xl p-8 text-center max-w-md w-full relative z-10 border border-rose-500/30 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Película no encontrada</h2>
          <p className="text-xs text-slate-300 mb-6">
            No pudimos encontrar los detalles del estreno solicitado. Puede que haya sido removido o el enlace sea incorrecto.
          </p>
          <Link
            to="/proximos-estrenos"
            className="water-btn w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Próximamente</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden pb-16">
      <VideoBackground />

      {/* Header superior */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/proximos-estrenos"
            className="water-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al listado</span>
          </Link>

          <div className="flex items-center space-x-2 text-slate-300 text-xs">
            <Film className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white tracking-wider">CINEMA RIWI</span>
          </div>
        </div>
      </header>

      {/* Contenido de Detalle */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Sección de Video Trailer Embebido (16:9 Responsive) */}
          <div className="liquid-glass rounded-3xl overflow-hidden p-2 sm:p-3 shadow-2xl border border-cyan-500/30">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
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

          {/* Información Detallada de la Película */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Poster miniatura */}
              <div className="hidden md:block md:col-span-1 rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[3/4] bg-slate-900">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Datos de la Película */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Próximamente en Cartelera</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {movie.title}
                  </h1>
                </div>

                {/* Badges de Géneros */}
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-[#16a34a] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Fecha de Estreno */}
                <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">
                      Fecha Oficial de Estreno
                    </p>
                    <p className="text-sm font-bold text-white">{movie.releaseDate}</p>
                  </div>
                </div>

                {/* Sinopsis */}
                {movie.synopsis && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-cyan-400" />
                      <span>Sinopsis</span>
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      {movie.synopsis}
                    </p>
                  </div>
                )}

                {/* Reparto Principal */}
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span>Reparto Principal</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.cast.map((actor) => (
                        <span
                          key={actor}
                          className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-200 font-medium"
                        >
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 items-center">
                  <Link
                    to="/proximos-estrenos"
                    className="water-btn px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Ver más en Próximamente</span>
                  </Link>

                  <div className="flex items-center space-x-1.5 text-xs text-cyan-300/80">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Preventa disponible próximamente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
