import { useEffect, useMemo, useState } from "react";
import { Star, Clock, Search, X, Ticket, Film, Loader2, Clapperboard } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: string;
  rating: string;
  poster: string;
  video: string;
  synopsis: string;
  price: number;
}

interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  time: string;
  date: string;
  room: string;
  format: string;
  price: number;
  availableSeats: number;
}

function BillboardPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [moviesRes, showtimesRes] = await Promise.all([
          fetch("/api/movies"),
          fetch("/api/showtimes"),
        ]);
        if (!moviesRes.ok || !showtimesRes.ok) {
          throw new Error("No fue posible cargar la cartelera");
        }
        setMovies(await moviesRes.json());
        setShowtimes(await showtimesRes.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error inesperado");
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  useEffect(() => {
    if (!selectedMovie) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedMovie(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMovie]);

  const genres = useMemo(() => {
    const found = new Set<string>();
    movies.forEach((m) =>
      m.genre.split("/").forEach((g) => found.add(g.trim())),
    );
    return ["Todos", ...Array.from(found)];
  }, [movies]);

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.synopsis.toLowerCase().includes(search.toLowerCase());
    const matchesGenre =
      selectedGenre === "Todos" ||
      m.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    return matchesSearch && matchesGenre;
  });

  const movieShowtimes = selectedMovie
    ? showtimes.filter((s) => s.movieId === selectedMovie.id)
    : [];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-300">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <span>Cargando cartelera...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-300">
        <Film className="h-10 w-10 text-rose-400" />
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="water-btn rounded-xl px-5 py-2 font-semibold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-8 md:px-8">
      <section className="liquid-glass mb-8 rounded-3xl p-6 md:p-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white md:text-4xl">
          <Clapperboard className="icon-float h-8 w-8 text-cyan-400" />
          Cartelera
        </h1>
        <p className="mt-2 text-slate-300">
          Películas disponibles en Cinema Riwi. Selecciona una para ver su tráiler y horarios.
        </p>
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar película..."
              className="liquid-glass-input w-full rounded-xl py-2.5 pl-10 pr-4 placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedGenre === g
                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                    : "border-white/15 text-slate-300 hover:border-cyan-400/50 hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filteredMovies.length === 0 ? (
        <p className="py-16 text-center text-slate-400">
          No se encontraron películas con esos criterios.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMovies.map((movie) => (
            <article
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              className="liquid-glass group cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={movie.poster}
                  alt={`Póster de ${movie.title}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-yellow-300 backdrop-blur">
                  <Star className="h-3.5 w-3.5 fill-yellow-300" />
                  {movie.rating}
                </span>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent" />
              </div>
              <div className="space-y-3 p-4">
                <h2 className="text-lg font-bold text-white">{movie.title}</h2>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{movie.genre}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {movie.duration}
                  </span>
                </div>
                <button className="water-btn w-full rounded-xl px-4 py-2 text-sm font-semibold">
                  Ver horarios
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {selectedMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="liquid-glass max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <video
                  key={selectedMovie.id}
                  src={selectedMovie.video}
                  className="aspect-video w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold text-white">{selectedMovie.title}</h2>
                  <button
                    onClick={() => setSelectedMovie(null)}
                    className="rounded-lg border border-white/15 p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className="flex items-center gap-1 text-yellow-300">
                    <Star className="h-4 w-4 fill-yellow-300" />
                    {selectedMovie.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedMovie.duration}
                  </span>
                  <span>{selectedMovie.genre}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{selectedMovie.synopsis}</p>
                <div className="mt-auto space-y-2">
                  <h3 className="flex items-center gap-2 font-semibold text-white">
                    <Ticket className="h-4 w-4 text-cyan-400" />
                    Horarios disponibles
                  </h3>
                  {movieShowtimes.length === 0 ? (
                    <p className="text-sm text-slate-400">Sin horarios programados.</p>
                  ) : (
                    <ul className="space-y-2">
                      {movieShowtimes.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition-colors hover:border-cyan-400/40"
                        >
                          <span className="font-bold text-cyan-300">{s.time}</span>
                          <span className="text-slate-300">{s.room}</span>
                          <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-200">
                            {s.format}
                          </span>
                          <span className="ml-auto text-right">
                            <strong className="text-white">${s.price.toFixed(2)}</strong>
                            <small className="block text-xs text-slate-400">
                              {s.availableSeats} butacas
                            </small>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default BillboardPage;
