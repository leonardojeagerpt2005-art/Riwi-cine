import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Film,
  Sparkles,
  Clapperboard,
  Search,
  X,
  Ticket,
  ShoppingBag,
  Languages,
  MapPin,
  LifeBuoy,
  LogOut,
  Calendar,
} from "lucide-react";
import { CinematicBackground } from "../components/CinematicBackground";
import { useUpcomingMovies } from "../components/upcoming/useUpcomingMovies";
import { UpcomingList } from "../components/upcoming/UpcomingList";
import { SupportModal } from "../components/SupportModal";
import { LocationModal } from "../components/location/LocationModal";
import { useLocation as useCinemaLocation } from "../components/location/useLocation";

export default function UpcomingReleasesPage() {
  const [, setLocation] = useLocation();
  const locationStore = useCinemaLocation();
  const { movies, loading, error } = useUpcomingMovies();

  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const [language, setLanguage] = useState<"es" | "en">(() =>
    localStorage.getItem("cinema_language") === "en" ? "en" : "es"
  );

  useEffect(() => {
    localStorage.setItem("cinema_language", language);
  }, [language]);

  useEffect(() => {
    const stored = localStorage.getItem("cinema_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cinema_user");
    setLocation("/login");
  };

  const userBookings = bookings.filter((b) => b.userEmail === user?.email);

  const copy =
    language === "es"
      ? {
          billboard: "Cartelera",
          upcoming: "Próximos Estrenos",
          bookings: "Mis Reservas",
          location: "Ubicación",
          support: "Soporte",
          logout: "Cerrar sesión",
          cart: "Carrito",
          featuredBadge: "Muy pronto en nuestras salas",
          heroTitle: "PRÓXIMOS ESTRENOS",
          heroSubtitle:
            "Explora los lanzamientos cinematográficos más esperados de la temporada. Conoce las fechas oficiales de estreno, avances exclusivos y detalles de producción.",
          releasesCount: "estrenos programados",
          searchPlaceholder: "Buscar películas, géneros...",
          allGenre: "Todos",
          footerText: "Cinema Riwi © 2026 — Todos los derechos reservados",
        }
      : {
          billboard: "Now Showing",
          upcoming: "Coming Soon",
          bookings: "My Bookings",
          location: "Location",
          support: "Support",
          logout: "Log out",
          cart: "Cart",
          featuredBadge: "Coming soon to our theaters",
          heroTitle: "COMING SOON",
          heroSubtitle:
            "Explore the most anticipated cinematic releases of the season. Discover official release dates, exclusive trailers, and production details.",
          releasesCount: "scheduled releases",
          searchPlaceholder: "Search movies, genres...",
          allGenre: "All",
          footerText: "Cinema Riwi © 2026 — All rights reserved",
        };

  // Extracción dinámica de los géneros disponibles
  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>();
    movies.forEach((movie) => {
      movie.genres.forEach((g) => genresSet.add(g));
    });
    return ["Todos", ...Array.from(genresSet)];
  }, [movies]);

  // Filtrado de películas por género y término de búsqueda
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesGenre =
        selectedGenre === "Todos" || movie.genres.includes(selectedGenre);
      const matchesSearch =
        movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.genres.some((g) =>
          g.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesGenre && matchesSearch;
    });
  }, [movies, selectedGenre, searchTerm]);

  return (
    <div className="min-h-screen relative pb-16">
      <CinematicBackground />

      {/* Navigation Header (Idéntica a la homepage) */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setLocation("/cinema")}
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(14,165,233,0.4)]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wider text-white">
                CINEMA RIWI
              </h2>
              <p className="text-[10px] text-cyan-300">
                {language === "es"
                  ? "Cartelera IMAX & Líquida"
                  : "IMAX & Liquid Cinema"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLocation("/cinema")}
              className="bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              {copy.billboard}
            </button>
            <button
              onClick={() => setLocation("/proximos-estrenos")}
              className="bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
              title={copy.upcoming}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{copy.upcoming}</span>
            </button>
            <button
              onClick={() => setLocation("/cinema?tab=bookings")}
              className="bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>
                {copy.bookings} ({userBookings.length})
              </span>
            </button>

            <button
              onClick={() => setLocation("/cart")}
              className="water-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              title="Abrir carrito"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copy.cart}</span>
            </button>

            <button
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="water-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              title={
                language === "es" ? "Cambiar a inglés" : "Switch to Spanish"
              }
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === "es" ? "EN" : "ES"}</span>
            </button>

            <button
              onClick={() => setIsLocationOpen(true)}
              className="water-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              title={
                language === "es" ? "Seleccionar ubicación" : "Select location"
              }
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {locationStore.confirmedCity ||
                  locationStore.selection.city ||
                  copy.location}
              </span>
            </button>

            <button
              onClick={() => setIsSupportOpen(true)}
              className="water-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copy.support}</span>
            </button>

            <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                {user?.name?.[0] || "U"}
              </div>
              <span className="text-xs font-medium text-slate-200">
                {user?.name || "Usuario"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/10 cursor-pointer"
              title={copy.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal con el mismo Layout de CinemaHome */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* Hero Banner en estilo Liquid Glass idéntico a CinemaHome */}
        <div className="relative rounded-3xl overflow-hidden liquid-glass border border-cyan-500/30 mb-10 p-6 md:p-10 shadow-2xl">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              src="https://res.cloudinary.com/lnyl9lwv/video/upload/v1787315361/rwnjzio97m5yje2ur5nb.mp4"
              className="w-full h-full object-cover opacity-35 scale-105"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#060913] via-[#060913]/85 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{copy.featuredBadge}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              {copy.heroTitle}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {copy.heroSubtitle}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>
                  {movies.length} {copy.releasesCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters idéntico a CinemaHome */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="liquid-glass-input w-full pl-10 pr-10 py-3 rounded-2xl text-sm placeholder:text-slate-400 focus:border-cyan-400 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                  selectedGenre === genre
                    ? "bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/30"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {genre === "Todos" ? copy.allGenre : genre}
              </button>
            ))}
          </div>
        </div>

        {/* Sección del Listado / Grid */}
        <section aria-label="Lista de películas en Próximamente">
          <UpcomingList
            movies={filteredMovies}
            loading={loading}
            error={error}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-xs text-slate-400 relative z-10 flex items-center justify-center space-x-2">
        <Clapperboard className="w-4 h-4 text-cyan-400" />
        <span>{copy.footerText}</span>
      </footer>

      {/* Modales Compartidos */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
