import React, { useMemo, useState } from "react";
import { X, Clock, Ticket, CheckCircle } from "lucide-react";
import { FaCouch } from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import type { Currency } from "./location/currencies";
import { formatPrice } from "./location/currencies";

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: string;
  poster: string;
  price: number;
  showtimes: string[];
}

type SeatType = "normal" | "pro";
type SeatStatus = "available" | "selected" | "occupied";

interface Seat {
  id: string;
  row: string;
  number: number;
  type: SeatType;
  status: SeatStatus;
}

interface SeatSelectorProps {
  movie: Movie;
  user: any;
  currency: Currency;
  onClose: () => void;
  onBookingSuccess: () => void;
}

function SeatItem({ seat, onToggle }: { seat: Seat; onToggle: (id: string) => void }) {
  const base = "w-10 h-10 rounded-lg flex items-center justify-center transition-transform";
  const common = "shadow-[0_6px_18px_rgba(0,0,0,0.6)]";

  const styles: Record<string, string> = {
    available_normal: "bg-slate-700 text-slate-200 hover:scale-105",
    available_pro: "bg-amber-600 text-amber-900 hover:scale-105",
    selected_normal: "bg-cyan-400 text-white shadow-cyan-500/40 scale-105",
    selected_pro: "bg-cyan-400 text-white shadow-cyan-500/40 scale-105",
    occupied: "bg-slate-900 text-slate-600 cursor-not-allowed opacity-70",
  };

  let cls = "";
  if (seat.status === "occupied") cls = styles.occupied;
  else if (seat.status === "selected") cls = seat.type === "pro" ? styles.selected_pro : styles.selected_normal;
  else cls = seat.type === "pro" ? styles.available_pro : styles.available_normal;

  const SeatIcon = seat.type === "pro" ? FaCouch : MdEventSeat;

  return (
    <button
      aria-label={`Asiento ${seat.id} ${seat.type} ${seat.status}`}
      disabled={seat.status === "occupied"}
      onClick={() => onToggle(seat.id)}
      className={`${base} ${common} ${cls} border border-white/8 backdrop-blur-sm`}
      title={`${seat.row}${seat.number} - ${seat.type}`}
    >
      <SeatIcon className="w-5 h-5" />
    </button>
  );
}

export function SeatSelector({ movie, user, currency, onClose, onBookingSuccess }: SeatSelectorProps) {
  const [selectedTime, setSelectedTime] = useState(movie.showtimes[0] || "18:00");
  const [selectedDate] = useState("Hoy, 10 Ago");
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);

  const rows = ["A", "B", "C", "D", "E", "F"];
  const seatsPerRow = 8;

  // Pre-occupied seats
  const occupiedSeatIds = useMemo(() => ["A3", "A4", "C2", "C3", "D7", "F5"], []);

  // Build initial seats with types (A-C normal, D-F pro)
  const initialSeats = useMemo(() => {
    const map: Seat[] = [];
    rows.forEach((row, rIdx) => {
      for (let i = 1; i <= seatsPerRow; i++) {
        const id = `${row}${i}`;
        const type: SeatType = rIdx <= 2 ? "normal" : "pro"; // A-C normal, D-F pro
        const status: SeatStatus = occupiedSeatIds.includes(id) ? "occupied" : "available";
        map.push({ id, row, number: i, type, status });
      }
    });
    return map;
  }, [rows, seatsPerRow, occupiedSeatIds]);

  const [seats, setSeats] = useState<Seat[]>(initialSeats);

  const selectedSeats = useMemo(() => seats.filter((s) => s.status === "selected").map((s) => s.id), [seats]);

  const toggleSeat = (seatId: string) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id !== seatId) return s;
        if (s.status === "occupied") return s;
        return { ...s, status: s.status === "selected" ? "available" : "selected" };
      })
    );
  };

  const totalPrice = selectedSeats.length * movie.price;

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    setLoading(true);
    try {
      const bookingData = {
        userId: user?.id || 1,
        userEmail: user?.email || "demo@riwicinema.com",
        movieId: movie.id,
        movieTitle: movie.title,
        poster: movie.poster,
        showtime: selectedTime,
        date: selectedDate,
        seats: selectedSeats,
        total: totalPrice,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        const data = await res.json();
        setTicketDetails(data);
        setBookingConfirmed(true);
        onBookingSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Group seats by rows for rendering
  const seatsByRow = useMemo(() => {
    const map: Record<string, Seat[]> = {};
    rows.forEach((row) => (map[row] = seats.filter((s) => s.row === row).sort((a, b) => a.number - b.number)));
    return map;
  }, [rows, seats]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-3xl p-6 md:p-8 relative border border-white/6 bg-gradient-to-b from-black/80 to-slate-900/80 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/6"
        >
          <X className="w-5 h-5" />
        </button>

        {bookingConfirmed ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-wide">¡Reserva Exitosa en Cinema Riwi!</h3>
              <p className="text-sm text-slate-300 mt-1">Tus asientos han sido reservados correctamente.</p>
            </div>

            <div className="w-full max-w-md p-5 rounded-2xl text-left border border-white/6 bg-gradient-to-b from-black/60 to-slate-900/40 space-y-3">
              <div className="flex items-center space-x-4">
                <img src={movie.poster} alt={movie.title} className="w-16 h-20 object-cover rounded-xl" />
                <div>
                  <h4 className="font-bold text-white text-base">{movie.title}</h4>
                  <p className="text-xs text-slate-400">{selectedDate} • {selectedTime}</p>
                  <p className="text-xs text-slate-400 mt-1">Asientos: <strong className="text-white">{selectedSeats.join(", ")}</strong></p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/8 flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Pagado:</span>
                <span className="font-bold text-cyan-400 text-lg">{formatPrice(totalPrice, currency)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-2 px-8 py-3 rounded-xl text-sm font-bold tracking-wider uppercase bg-cyan-500 text-black"
            >
              Volver a la Cartelera
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <img src={movie.poster} alt={movie.title} className="w-16 h-20 object-cover rounded-xl shadow-md" />
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/6 text-slate-200 border border-white/8">
                  {movie.genre}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{movie.title}</h3>
                <p className="text-xs text-slate-400">Duración: {movie.duration} • {formatPrice(movie.price, currency)} por asiento</p>
              </div>
            </div>

            {/* Showtime Selection */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Selecciona el Horario</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {movie.showtimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      selectedTime === time
                        ? "bg-cyan-500 text-black border-cyan-400 shadow-lg"
                        : "bg-white/6 text-slate-200 border-white/8 hover:bg-white/8"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Screen indicator */}
            <div className="mb-6 text-center">
              <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_12px_rgba(56,189,248,0.5)] mb-2" />
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Pantalla Principal IMAX</span>
            </div>

            {/* Seating Sections */}
            <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/8">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Normal Rows */}
                <div>
                  <h4 className="text-sm text-slate-300 font-semibold mb-3">Fila Normal</h4>
                  <div className="space-y-2">
                    {rows.slice(0, 3).map((row) => (
                      <div key={row} className="flex items-center space-x-3">
                        <span className="w-6 text-center text-xs font-bold text-slate-400">{row}</span>
                        <div className="grid grid-cols-8 gap-2">
                          {seatsByRow[row].map((seat) => (
                            <SeatItem key={seat.id} seat={seat} onToggle={toggleSeat} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Rows */}
                <div>
                  <h4 className="text-sm text-slate-300 font-semibold mb-3">Fila Pro (Reclinables)</h4>
                  <div className="space-y-2">
                    {rows.slice(3).map((row) => (
                      <div key={row} className="flex items-center space-x-3">
                        <span className="w-6 text-center text-xs font-bold text-slate-400">{row}</span>
                        <div className="grid grid-cols-8 gap-2">
                          {seatsByRow[row].map((seat) => (
                            <SeatItem key={seat.id} seat={seat} onToggle={toggleSeat} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between mt-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded bg-slate-700 border border-white/8" />
                      <span>Normal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded bg-amber-600 border border-white/8" />
                      <span>Pro</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded bg-cyan-400 border border-white/10" />
                      <span>Seleccionado</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded bg-slate-900 border border-white/6" />
                      <span>Ocupado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary & CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-white/8">
              <div>
                <p className="text-xs text-slate-400">
                  Asientos: <strong className="text-white">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "Ninguno"}</strong>
                </p>
                <p className="text-lg font-bold text-cyan-400 mt-0.5">Total: {formatPrice(totalPrice, currency)}</p>
              </div>

              <button
                disabled={selectedSeats.length === 0 || loading}
                onClick={handleConfirmBooking}
                className="px-6 py-3 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center space-x-2 bg-cyan-500 text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Ticket className="w-4 h-4" />
                <span>{loading ? "Reservando..." : "Confirmar Reserva"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
