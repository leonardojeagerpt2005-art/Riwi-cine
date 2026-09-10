import React, { useEffect, useState } from "react";
import { useLocation as useWouterLocation } from "wouter";
import {
  Film,
  Search,
  LifeBuoy,
  LogOut,
  Ticket,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Languages,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { CinematicBackground } from "../components/CinematicBackground";
import { MovieCard } from "../components/MovieCard";
import { SeatSelector } from "../components/SeatSelector";
import { SupportModal } from "../components/SupportModal";
import { LocationModal } from "../components/location/LocationModal";
import { useLocation as useCinemaLocation } from "../components/location/useLocation";
import {
  getCurrencyForCountry,
  formatPrice,
} from "../components/location/currencies";

export default function CinemaHome() {
  const [, setLocation] = useWouterLocation();
  const locationStore = useCinemaLocation();
  const [user, setUser] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [activeTab, setActiveTab] = useState<"catalog" | "bookings">("catalog");

  const [selectedMovieForBooking, setSelectedMovieForBooking] =
    useState<any>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(
    null
  );
  const [language, setLanguage] = useState<"es" | "en">(() =>
    localStorage.getItem("cinema_language") === "en" ? "en" : "es"
  );

  const currency = getCurrencyForCountry(locationStore.selection.country);
  const copy =
    language === "es"
      ? {
          billboard: "Cartelera",
          bookings: "Mis Reservas",
          location: "Ubicación",
          support: "Soporte",
          logout: "Cerrar sesión",
          featured: "Estreno Estelar IMAX",
          reserve: "Reservar ahora",
          search: "Buscar películas, géneros...",
          loading: "Cargando cartelera...",
          empty: "No se encontraron películas con ese criterio.",
          bookingTitle: "Mis Entradas y Reservas",
          bookingSubtitle: "Historial de butacas reservadas en Cinema Riwi",
          noBookings: "No tienes reservas activas",
          noBookingsText:
            "Explora nuestra cartelera y selecciona tus películas favoritas para apartar tus butacas.",
          seeBillboard: "Ver cartelera",
          confirmed: "Confirmada",
          seats: "Asientos",
          select: "Seleccionar y reservar",
          cancelBooking: "Cancelar reserva",
          cancelConfirm:
            "¿Quieres cancelar esta reserva? Esta acción no se puede deshacer.",
          cancelSuccess: "Reserva cancelada correctamente",
          cancelError: "No fue posible cancelar la reserva",
          genres: ["Todos", "Ciencia ficción", "Suspenso", "Drama", "Acción"],
        }
      : {
          billboard: "Now Showing",
          bookings: "My Bookings",
          location: "Location",
          support: "Support",
          logout: "Log out",
          featured: "IMAX Featured Premiere",
          reserve: "Book now",
          search: "Search movies, genres...",
          loading: "Loading movies...",
          empty: "No movies were found for that criteria.",
          bookingTitle: "My Tickets and Bookings",
          bookingSubtitle: "Your reserved seats at Cinema Riwi",
          noBookings: "You have no active bookings",
          noBookingsText:
            "Explore our movies and select your favorites to reserve your seats.",
          seeBillboard: "View movies",
          confirmed: "Confirmed",
          seats: "Seats",
          select: "Select and book",
          cancelBooking: "Cancel booking",
          cancelConfirm:
            "Do you want to cancel this booking? This action cannot be undone.",
          cancelSuccess: "Booking cancelled successfully",
          cancelError: "The booking could not be cancelled",
          genres: ["All", "Science Fiction", "Thriller", "Drama", "Action"],
        };
  const genreFilters = [
    { value: "Todos", label: copy.genres[0] },
    { value: "Ciencia ficción", label: copy.genres[1] },
    { value: "Suspenso", label: copy.genres[2] },
    { value: "Drama", label: copy.genres[3] },
    { value: "Acción", label: copy.genres[4] },
  ];

  useEffect(() => {
    localStorage.setItem("cinema_language", language);
  }, [language]);

  useEffect(() => {
    const stored = localStorage.getItem("cinema_user");
    if (!stored) {
      setLocation("/login");
      return;
    }
    setUser(JSON.parse(stored));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [moviesRes, bookingsRes] = await Promise.all([
        fetch("/api/movies"),
        fetch("/api/bookings"),
      ]);
      const moviesData = await moviesRes.json();
      const bookingsData = await bookingsRes.json();
      setMovies(moviesData);
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cinema_user");
    setLocation("/login");
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm(copy.cancelConfirm)) return;

    setCancellingBookingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Unable to delete booking");

      setBookings(currentBookings =>
        currentBookings.filter(booking => booking.id !== bookingId)
      );
      toast.success(copy.cancelSuccess);
    } catch (error) {
      console.error(error);
      toast.error(copy.cancelError);
    } finally {
      setCancellingBookingId(null);
    }
  };

  const filteredMovies = movies.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.synopsis.toLowerCase().includes(search.toLowerCase());
    const matchesGenre =
      selectedGenre === "Todos" ||
      m.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    return matchesSearch && matchesGenre;
  });

  const userBookings = bookings.filter(b => b.userEmail === user?.email);

  return (
    <div className="min-h-screen relative pb-16">
      <CinematicBackground />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setActiveTab("catalog")}
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
              onClick={() => setActiveTab("catalog")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "catalog"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              {copy.billboard}
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === "bookings"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>
                {copy.bookings} ({userBookings.length})
              </span>
            </button>

            <button
              onClick={() => setLocation("/cart")}
              className="water-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
              title="Abrir carrito"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Carrito</span>
            </button>

            <button
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="water-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
              title={
                language === "es" ? "Cambiar a inglés" : "Switch to Spanish"
              }
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === "es" ? "EN" : "ES"}</span>
            </button>

            <button
              onClick={() => setIsLocationOpen(true)}
              className="water-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
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
              className="water-btn px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
              <span>{copy.support}</span>
            </button>

            <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                {user?.name?.[0] || "U"}
              </div>
              <span className="text-xs font-medium text-slate-200">
                {user?.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/10"
              title={copy.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {activeTab === "catalog" ? (
          <>
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden liquid-glass border border-cyan-500/30 mb-10 p-6 md:p-10 shadow-2xl">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <video
                  src="https://res.cloudinary.com/lnyl9lwv/video/upload/v1787315361/rwnjzio97m5yje2ur5nb.mp4"
                  className="w-full h-full object-cover opacity-40 scale-105"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060913] via-[#060913]/80 to-transparent" />
              </div>

              <div className="relative z-10 max-w-xl space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{copy.featured}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  THOR
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {language === "es"
                    ? "El poderoso pero arrogante dios del trueno es desterrado a la Tierra, donde deberá demostrar que es digno de su legendario martillo, Mjölnir. Vive el estreno en IMAX."
                    : "The mighty but arrogant god of thunder is banished to Earth, where he must prove he is worthy of his legendary hammer, Mjölnir. Experience the premiere in IMAX."}
                </p>
                <button
                  onClick={() => {
                    const thor = movies.find(m =>
                      m.title.toLowerCase().includes("thor")
                    );
                    setSelectedMovieForBooking(thor || movies[0]);
                  }}
                  className="water-btn px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center space-x-2 shadow-lg"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{copy.reserve}</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={copy.search}
                  className="liquid-glass-input w-full pl-10 pr-4 py-3 rounded-2xl text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {genreFilters.map(genre => (
                  <button
                    key={genre.value}
                    onClick={() => setSelectedGenre(genre.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      selectedGenre === genre.value
                        ? "bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/30"
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Movie Catalog Grid */}
            {loading ? (
              <div className="py-20 text-center text-slate-400">
                {copy.loading}
              </div>
            ) : filteredMovies.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                {copy.empty}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredMovies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    currency={currency}
                    onSelect={m => setSelectedMovieForBooking(m)}
                    selectLabel={copy.select}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* My Bookings Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {copy.bookingTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {copy.bookingSubtitle}
                </p>
              </div>
            </div>

            {userBookings.length === 0 ? (
              <div className="liquid-glass p-12 rounded-3xl text-center space-y-4 border border-white/10">
                <Ticket className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">
                  {copy.noBookings}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {copy.noBookingsText}
                </p>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="water-btn px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase inline-block"
                >
                  {copy.seeBillboard}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userBookings.map(b => (
                  <div
                    key={b.id}
                    className="liquid-glass rounded-2xl p-6 border border-cyan-500/30 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5"
                  >
                    <img
                      src={b.poster}
                      alt={b.movieTitle}
                      className="w-24 h-32 object-cover rounded-xl shadow-md shrink-0 mx-auto sm:mx-0"
                    />
                    <div className="flex flex-col justify-between flex-grow space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {copy.confirmed}
                          </span>
                          <span className="text-xs text-slate-400">
                            ID: #{b.id}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1.5">
                          {b.movieTitle}
                        </h3>
                        <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-cyan-400" />
                            <span>{b.date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{b.showtime}</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <span className="text-slate-400">
                          {copy.seats}:{" "}
                          <strong className="text-cyan-300">
                            {b.seats.join(", ")}
                          </strong>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">
                            {formatPrice(b.total, currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(b.id)}
                            disabled={cancellingBookingId === b.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 font-semibold text-rose-300 transition-colors hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            title={copy.cancelBooking}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>
                              {cancellingBookingId === b.id
                                ? "..."
                                : copy.cancelBooking}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Seat Selector Modal */}
      {selectedMovieForBooking && (
        <SeatSelector
          movie={selectedMovieForBooking}
          user={user}
          currency={currency}
          onClose={() => setSelectedMovieForBooking(null)}
          onCartCreated={() => {
            setSelectedMovieForBooking(null);
            setLocation("/cart");
          }}
        />
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        userEmail={user?.email}
      />
    </div>
  );
}
