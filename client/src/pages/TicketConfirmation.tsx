import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Mail,
  QrCode,
  RefreshCw,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Shield,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { CinematicBackground } from "../components/CinematicBackground";
import { QRCodeSVG } from "qrcode.react";
import {
  formatPrice,
  getCurrencyForCountry,
} from "../components/location/currencies";

interface Booking {
  id: number;
  movieTitle: string;
  poster: string;
  date: string;
  showtime: string;
  seats: string[];
  total: number;
  userEmail: string;
  createdAt: string;
  qrCode?: string;
}

export default function TicketConfirmation() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const bookingId = params.id ? parseInt(params.id) : null;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [downloadingTicket, setDownloadingTicket] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const storedLocation = localStorage.getItem("cineclub_location");
  let country = "";
  try {
    country = storedLocation ? JSON.parse(storedLocation).country || "" : "";
  } catch {
    country = "";
  }
  const currency = getCurrencyForCountry(country);

  useEffect(() => {
    if (!bookingId) {
      setLocation("/cinema");
      return;
    }
    loadBooking();
  }, [bookingId, setLocation]);

  const loadBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) throw new Error("Reserva no encontrada");
      const data = await response.json();
      setBooking(data);
    } catch (err) {
      toast.error("No se pudo cargar la reserva");
      setLocation("/cinema");
    } finally {
      setLoading(false);
    }
  };

  const generateQRData = (booking: Booking) => {
    return JSON.stringify({
      bookingId: booking.id,
      movie: booking.movieTitle,
      date: booking.date,
      time: booking.showtime,
      seats: booking.seats,
      email: booking.userEmail,
      issuedAt: booking.createdAt,
    });
  };

  const downloadTicket = async () => {
    if (!booking) return;
    setDownloadingTicket(true);
    try {
      const qrData = generateQRData(booking);
      const ticketContent = `
CINEMA RIWI - ENTRADA DIGITAL
==============================

Película: ${booking.movieTitle}
Fecha: ${booking.date}
Hora: ${booking.showtime}
Asientos: ${booking.seats.join(", ")}
Cantidad: ${booking.seats.length} entrada(s)

Cliente: ${booking.userEmail}
Reserva ID: #${booking.id}
Fecha de compra: ${new Date(booking.createdAt).toLocaleString()}

Código QR: ${qrData}

---
Esta entrada es válida para una sola entrada.
Presente el código QR en la entrada del cine.
      `.trim();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([ticketContent], { type: "text/plain" })
      );
      link.download = `entrada-${booking.movieTitle.replace(/\s+/g, "-")}-${booking.id}.txt`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success("Entrada descargada");
    } catch {
      toast.error("No se pudo descargar la entrada");
    } finally {
      setDownloadingTicket(false);
    }
  };

  const downloadInvoice = async () => {
    if (!booking) return;
    setDownloadingInvoice(true);
    try {
      const invoiceContent = `
CINEMA RIWI - FACTURA / COMPROBANTE
===================================

DATOS DEL CLIENTE
Nombre: ${localStorage.getItem("cinema_user") ? JSON.parse(localStorage.getItem("cinema_user")!).name : "Cliente"}
Email: ${booking.userEmail}

DETALLE DE LA COMPRA
--------------------
Película: ${booking.movieTitle}
Fecha de función: ${booking.date}
Hora: ${booking.showtime}
Asientos: ${booking.seats.join(", ")}
Cantidad: ${booking.seats.length}

PRECIOS
-------
Subtotal: ${formatPrice(booking.total, currency)}
Impuestos: Incluidos
TOTAL: ${formatPrice(booking.total, currency)}

MÉTODO DE PAGO: Tarjeta / PSE / Efectivo (según reserva)
FECHA DE EMISIÓN: ${new Date().toLocaleString()}
NÚMERO DE FACTURA: FAC-${booking.id.toString().padStart(6, "0")}
RESERVA ID: #${booking.id}

---
Cinema Riwi - Todos los derechos reservados
Esta factura es un comprobante de pago válido.
      `.trim();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([invoiceContent], { type: "text/plain" })
      );
      link.download = `factura-cinema-riwi-${booking.id}.txt`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success("Factura descargada");
    } catch {
      toast.error("No se pudo descargar la factura");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const resendTicket = async () => {
    if (!booking) return;
    setRegenerating(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: booking.userEmail }),
      });
      if (!response.ok) throw new Error("Error al reenviar");
      toast.success("Entrada reenviada por email");
    } catch {
      toast.error("No se pudo reenviar la entrada");
    } finally {
      setRegenerating(false);
    }
  };

  const regenerateQR = async () => {
    if (!booking) return;
    setRegenerating(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/regenerate-qr`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Error al regenerar");
      const data = await response.json();
      setBooking({ ...booking, qrCode: data.qrCode });
      toast.success("Código QR regenerado");
    } catch {
      toast.error("No se pudo regenerar el QR");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] text-white grid place-items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 text-cyan-400 animate-spin" />
          <p className="text-slate-400">Cargando tu entrada...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#060913] text-white grid place-items-center">
        <div className="text-center">
          <Ticket className="mx-auto size-16 text-slate-500 mb-4" />
          <h2 className="text-xl font-bold">Reserva no encontrada</h2>
          <button
            onClick={() => setLocation("/cinema")}
            className="mt-4 water-btn rounded-xl px-5 py-3 text-sm font-bold"
          >
            Volver a cartelera
          </button>
        </div>
      </div>
    );
  }

  const qrData = generateQRData(booking);

  return (
    <div className="min-h-screen relative text-white">
      <CinematicBackground />
      <main className="relative z-10 min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <button
          onClick={() => setLocation("/cinema")}
          className="mb-6 water-btn rounded-xl px-4 py-2 text-sm flex items-center gap-2"
        >
          <ArrowLeft className="size-4" />
          Volver a cartelera
        </button>

        <div className="liquid-glass rounded-3xl p-6 md:p-8 space-y-8 border border-white/10">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto size-20 rounded-full bg-emerald-400/15 text-emerald-300 grid place-items-center">
              <CheckCircle className="size-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black">¡Compra Confirmada!</h1>
            <p className="text-slate-300">
              Tu entrada está lista. Guarda el código QR para acceder a la función.
            </p>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="relative p-6 bg-black/40 rounded-2xl border border-white/10">
              <QRCodeSVG
                value={qrData}
                size={200}
                level="M"
                includeMargin={true}
                bgColor="#060913"
                fgColor="#22d3ee"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-xs font-medium text-cyan-300">
                Escanear en entrada
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={booking.poster}
                  alt={booking.movieTitle}
                  className="w-24 h-32 object-cover rounded-xl shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold truncate">{booking.movieTitle}</h2>
                  <p className="text-sm text-slate-400 mt-1">Reserva #{booking.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="size-4 text-cyan-400" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="size-4 text-cyan-400" />
                  <span>{booking.showtime}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Ticket className="size-4 text-cyan-400" />
                  <span>{booking.seats.length} entrada(s)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="size-4 text-cyan-400" />
                  <span>{booking.seats.join(", ")}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-slate-400">Total pagado</span>
                <span className="text-2xl font-black text-cyan-300">
                  {formatPrice(booking.total, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            <button
              onClick={downloadTicket}
              disabled={downloadingTicket}
              className="water-btn rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Download className="size-4" />
              <span>Descargar entrada</span>
              {downloadingTicket && <Loader2 className="size-4 animate-spin" />}
            </button>

            <button
              onClick={downloadInvoice}
              disabled={downloadingInvoice}
              className="water-btn rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              <FileText className="size-4" />
              <span>Descargar factura</span>
              {downloadingInvoice && <Loader2 className="size-4 animate-spin" />}
            </button>

            <button
              onClick={resendTicket}
              disabled={regenerating}
              className="water-btn rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Mail className="size-4" />
              <span>Reenviar por email</span>
              {regenerating && <Loader2 className="size-4 animate-spin" />}
            </button>

            <button
              onClick={regenerateQR}
              disabled={regenerating}
              className="water-btn rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="size-4" />
              <span>Regenerar QR</span>
              {regenerating && <Loader2 className="size-4 animate-spin" />}
            </button>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Shield className="size-5 text-cyan-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-medium text-cyan-300">Entrada segura</p>
              <p>Este código QR es único e intransferible. No lo compartas en redes sociales.</p>
              <p>Presenta esta pantalla o el archivo descargado en la entrada del cine.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}