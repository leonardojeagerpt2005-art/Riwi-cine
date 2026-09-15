import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Check,
  Clock3,
  Minus,
  Plus,
  ReceiptText,
  Search,
  ShoppingBag,
  Sparkles,
  Ticket,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CinematicBackground } from "../components/CinematicBackground";
import {
  formatPrice,
  getCurrencyForCountry,
} from "../components/location/currencies";

type CartLine = {
  snackId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

type CartTicket = {
  movieId: number;
  movieTitle: string;
  poster: string;
  showtime: string;
  date: string;
  seats: string[];
  unitPrice: number;
  quantity: number;
};

type Cart = {
  id: number;
  userId: number;
  userEmail: string;
  tickets: CartTicket[];
  snacks: CartLine[];
  expiresAt: string;
  status: string;
  ticketsSubtotal: number;
  snacksSubtotal: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  membershipDiscount: number;
  giftcardDiscount: number;
};

type Snack = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  promotion?: string;
  image?: string;
};

export default function CartPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [codeType, setCodeType] = useState<"membership" | "giftcard">(
    "membership"
  );
  const [code, setCode] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paid, setPaid] = useState(false);

  const storedLocation = localStorage.getItem("cineclub_location");
  let country = "";
  try {
    country = storedLocation ? JSON.parse(storedLocation).country || "" : "";
  } catch {
    country = "";
  }
  const currency = getCurrencyForCountry(country);

  const loadCart = async (userId: number) => {
    const response = await fetch(`/api/cart?userId=${userId}`);
    if (response.status === 404 || response.status === 410) {
      setCart(null);
      if (response.status === 410)
        toast.error("Tu carrito expiró. Selecciona tus sillas nuevamente.");
      return;
    }
    if (!response.ok) throw new Error("No se pudo cargar el carrito");
    setCart(await response.json());
  };

  useEffect(() => {
    const stored = localStorage.getItem("cinema_user");
    if (!stored) {
      setLocation("/login");
      return;
    }
    const parsedUser = JSON.parse(stored);
    setUser(parsedUser);
    Promise.all([
      loadCart(parsedUser.id),
      fetch("/api/snacks")
        .then(response => response.json())
        .then(setSnacks),
      fetch("/api/snacks/categories")
        .then(response => response.json())
        .then(setCategories),
    ])
      .catch(() => toast.error("No fue posible cargar la compra"))
      .finally(() => setLoading(false));
  }, [setLocation]);

  useEffect(() => {
    if (!cart?.expiresAt) return;
    const updateTimer = () =>
      setRemaining(
        Math.max(0, new Date(cart.expiresAt).getTime() - Date.now())
      );
    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(timer);
  }, [cart?.expiresAt]);

  const filteredSnacks = useMemo(() => {
    const normalized = search.toLowerCase();
    return snacks.filter(snack => {
      const matchesCategory =
        category === "Todos" || snack.category === category;
      const matchesSearch = `${snack.name} ${snack.description}`
        .toLowerCase()
        .includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [category, search, snacks]);

  const timerText = `${String(Math.floor(remaining / 60000)).padStart(2, "0")}:${String(
    Math.floor((remaining % 60000) / 1000)
  ).padStart(2, "0")}`;

  const addSnack = async (snack: Snack) => {
    if (!cart || snack.stock <= 0) return;
    setUpdating(true);
    try {
      const response = await fetch("/api/cart/snacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          snackId: snack.id,
          quantity: 1,
        }),
      });
      if (!response.ok) throw new Error("No se pudo agregar");
      setCart(await response.json());
      toast.success(`${snack.name} agregado`);
    } catch {
      toast.error("No se pudo agregar el producto");
    } finally {
      setUpdating(false);
    }
  };

  const changeSnackQuantity = async (line: CartLine, quantity: number) => {
    if (!cart || quantity < 1) {
      if (cart) {
        const response = await fetch(
          `/api/cart/snacks/${line.snackId}?userId=${user.id}`,
          { method: "DELETE" }
        );
        if (response.ok) setCart(await response.json());
      }
      return;
    }
    const response = await fetch(`/api/cart/snacks/${line.snackId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, quantity }),
    });
    if (response.ok) setCart(await response.json());
  };

  const applyCode = async () => {
    if (!code.trim()) return;
    const endpoint =
      codeType === "membership" ? "apply-membership" : "apply-giftcard";
    const response = await fetch(`/api/cart/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, code: code.trim() }),
    });
    if (!response.ok) {
      toast.error(
        codeType === "membership" ? "Membresía no válida" : "Bono no válido"
      );
      return;
    }
    setCart(await response.json());
    setCode("");
    toast.success("Descuento aplicado a tu carrito");
  };

  const confirmPayment = async () => {
    if (!cart || remaining === 0 || !paymentMethod) return;
    setUpdating(true);
    try {
      for (const ticket of cart.tickets) {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
            movieId: ticket.movieId,
            movieTitle: ticket.movieTitle,
            poster: ticket.poster,
            showtime: ticket.showtime,
            date: ticket.date,
            seats: ticket.seats,
            total: cart.total,
            snacks: cart.snacks,
            paymentMethod,
            createdAt: new Date().toISOString(),
          }),
        });
        if (!response.ok) throw new Error("No se pudo confirmar");
      }
      await fetch(`/api/cart/${cart.id}`, { method: "DELETE" });
      setPaid(true);
      toast.success("Pago confirmado");
    } catch {
      toast.error("No se pudo confirmar el pago");
    } finally {
      setUpdating(false);
    }
  };

  const downloadReceipt = () => {
    if (!cart) return;
    const receipt = [
      "CINEMA RIWI - COMPROBANTE DE COMPRA",
      `Cliente: ${user.name} (${user.email})`,
      `Fecha: ${new Date().toLocaleString()}`,
      "",
      ...cart.tickets.map(
        ticket =>
          `${ticket.movieTitle} | ${ticket.showtime} | Sillas: ${ticket.seats.join(", ")}`
      ),
      ...cart.snacks.map(item => `${item.name} x${item.quantity}`),
      "",
      `Total: ${formatPrice(cart.total, currency)}`,
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([receipt], { type: "text/plain" })
    );
    link.download = `comprobante-cinema-riwi-${cart.id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#060913] text-white grid place-items-center">
        Cargando tu compra...
      </div>
    );

  if (paid) {
    return (
      <div className="min-h-screen relative text-white">
        <CinematicBackground />
        <main className="relative z-10 min-h-screen grid place-items-center p-6">
          <div className="liquid-glass max-w-lg w-full rounded-3xl p-10 text-center space-y-5">
            <div className="mx-auto size-16 rounded-full bg-emerald-400/15 text-emerald-300 grid place-items-center">
              <Check className="size-8" />
            </div>
            <h1 className="text-3xl font-black">Compra confirmada</h1>
            <p className="text-slate-300">
              Tus entradas y productos están listos para reclamar en Cinema
              Riwi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={downloadReceipt}
                className="water-btn rounded-xl px-5 py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                <ReceiptText className="size-4" />
                Descargar comprobante
              </button>
              <button
                onClick={() => setLocation("/cinema")}
                className="rounded-xl px-5 py-3 text-sm font-bold bg-cyan-400 text-slate-950"
              >
                Volver a cartelera
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white pb-16">
      <CinematicBackground />
      <header className="sticky top-0 z-30 liquid-glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => setLocation("/cinema")}
            className="water-btn rounded-xl px-3 py-2 text-sm flex items-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Cartelera
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-cyan-300 size-5" />
            <span className="font-black tracking-widest">MI COMPRA</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
            <span>{user?.name}</span>
            <span className="size-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      </header>
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="min-w-0 flex-1 space-y-8">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
                    Sprint 03
                  </p>
                  <h1 className="text-3xl md:text-4xl font-black mt-2">
                    Confitería para la función
                  </h1>
                  <p className="text-sm text-slate-400 mt-2">
                    Agrega tus favoritos y lleva todo listo a la sala.
                  </p>
                </div>
                {cart && (
                  <div
                    className={`rounded-2xl border px-4 py-3 flex items-center gap-3 ${remaining < 120000 ? "border-rose-400/50 bg-rose-400/10 text-rose-200" : "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"}`}
                  >
                    <Clock3 className="size-5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest opacity-70">
                        Tiempo reservado
                      </p>
                      <p className="font-mono font-black text-lg">
                        {timerText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!cart ? (
              <div className="liquid-glass rounded-3xl p-10 text-center space-y-4">
                <Ticket className="mx-auto size-12 text-slate-500" />
                <h2 className="text-xl font-bold">Tu carrito está vacío</h2>
                <p className="text-sm text-slate-400">
                  Selecciona tus sillas para comenzar una compra.
                </p>
                <button
                  onClick={() => setLocation("/cinema")}
                  className="water-btn rounded-xl px-5 py-3 text-sm font-bold"
                >
                  Elegir función
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Ticket className="size-5 text-cyan-300" />
                      Tus entradas
                    </h2>
                    <button
                      onClick={() => setLocation("/cinema")}
                      className="text-xs text-cyan-300 hover:text-white"
                    >
                      Editar sillas
                    </button>
                  </div>
                  {cart.tickets.map(ticket => (
                    <div
                      key={`${ticket.movieId}-${ticket.showtime}`}
                      className="liquid-glass rounded-2xl p-4 flex gap-4"
                    >
                      <img
                        src={ticket.poster}
                        alt={ticket.movieTitle}
                        className="w-16 h-22 object-cover rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold truncate">
                          {ticket.movieTitle}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {ticket.date} · {ticket.showtime}
                        </p>
                        <p className="text-xs text-cyan-200 mt-2">
                          Sillas: {ticket.seats.join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">
                          {ticket.seats.length} entrada(s)
                        </p>
                        <p className="font-bold text-cyan-300 mt-2">
                          {formatPrice(
                            ticket.unitPrice * ticket.quantity,
                            currency
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Utensils className="size-5 text-amber-300" />
                      Catálogo de confitería
                    </h2>
                    <span className="text-xs text-slate-400">
                      {filteredSnacks.length} productos
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 size-4 text-cyan-300" />
                      <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Buscar productos"
                        className="liquid-glass-input rounded-xl w-full py-2.5 pl-9 pr-3 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      <button
                        onClick={() => setCategory("Todos")}
                        className={`rounded-xl px-3 py-2 text-xs whitespace-nowrap ${category === "Todos" ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-slate-300"}`}
                      >
                        Todos
                      </button>
                      {categories.map(item => (
                        <button
                          key={item}
                          onClick={() => setCategory(item)}
                          className={`rounded-xl px-3 py-2 text-xs whitespace-nowrap ${category === item ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-slate-300"}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredSnacks.map(snack => (
                      <article
                        key={snack.id}
                        className={`liquid-glass rounded-2xl p-4 ${snack.stock <= 0 ? "opacity-60" : ""}`}
                      >
                        <div className="h-28 rounded-xl bg-gradient-to-br from-amber-300/30 via-orange-400/10 to-cyan-400/20 grid place-items-center mb-4 overflow-hidden">
                          {snack.image ? (
                            <img
                              src={snack.image}
                              alt={snack.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Utensils className="size-10 text-amber-200" />
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-amber-200">
                              {snack.category}
                            </p>
                            <h3 className="font-bold mt-1">{snack.name}</h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {snack.description}
                            </p>
                          </div>
                          <span className="font-bold text-cyan-300 whitespace-nowrap">
                            {formatPrice(snack.price, currency)}
                          </span>
                        </div>
                        {snack.promotion && (
                          <p className="mt-3 text-[11px] text-emerald-300 flex items-center gap-1">
                            <Sparkles className="size-3" />
                            {snack.promotion}
                          </p>
                        )}
                        <button
                          disabled={snack.stock <= 0 || updating}
                          onClick={() => addSnack(snack)}
                          className="mt-4 w-full rounded-xl py-2.5 text-xs font-bold bg-white/10 hover:bg-cyan-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:bg-white/5"
                        >
                          {snack.stock <= 0 ? "Agotado" : "Agregar al carrito"}
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
          <aside className="lg:w-[360px] shrink-0">
            <div className="liquid-glass rounded-3xl p-5 lg:sticky lg:top-28 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Resumen</h2>
                <span className="text-xs text-slate-400">
                  {cart?.snacks.length || 0} productos
                </span>
              </div>
              {cart && cart.snacks.length > 0 && (
                <div className="space-y-3 border-b border-white/10 pb-4">
                  {cart.snacks.map(line => (
                    <div key={line.snackId} className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{line.name}</p>
                        <p className="text-xs text-slate-400">
                          {formatPrice(line.unitPrice, currency)}
                        </p>
                      </div>
                      <div className="flex items-center border border-white/10 rounded-lg">
                        <button
                          onClick={() =>
                            changeSnackQuantity(line, line.quantity - 1)
                          }
                          className="p-1.5 hover:text-cyan-300"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() =>
                            changeSnackQuantity(line, line.quantity + 1)
                          }
                          className="p-1.5 hover:text-cyan-300"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => changeSnackQuantity(line, 0)}
                        className="p-1.5 text-rose-300 hover:text-rose-100"
                        title="Eliminar"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {cart && (
                <>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>Entradas</span>
                      <span>{formatPrice(cart.ticketsSubtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Confitería</span>
                      <span>{formatPrice(cart.snacksSubtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>{formatPrice(cart.subtotal, currency)}</span>
                    </div>
                    {cart.discount > 0 && (
                      <div className="flex justify-between text-emerald-300">
                        <span>Descuentos</span>
                        <span>-{formatPrice(cart.discount, currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>Impuestos</span>
                      <span>{formatPrice(cart.tax, currency)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 mt-3 flex justify-between font-black text-lg">
                      <span>Total</span>
                      <span className="text-cyan-300">
                        {formatPrice(cart.total, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={codeType}
                        onChange={event =>
                          setCodeType(
                            event.target.value as "membership" | "giftcard"
                          )
                        }
                        className="bg-slate-900 border border-white/10 rounded-xl text-xs px-2"
                      >
                        <option value="membership">Membresía</option>
                        <option value="giftcard">Bono</option>
                      </select>
                      <input
                        value={code}
                        onChange={event => setCode(event.target.value)}
                        placeholder={
                          codeType === "membership" ? "RIWI15" : "CINE25"
                        }
                        className="liquid-glass-input min-w-0 flex-1 rounded-xl px-3 py-2 text-xs"
                      />
                      <button
                        onClick={applyCode}
                        className="rounded-xl bg-white/10 px-3 text-xs font-bold hover:bg-cyan-400 hover:text-slate-950"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                  <button
                    disabled={updating || remaining === 0}
                    onClick={() => setPaymentOpen(true)}
                    className="w-full rounded-xl bg-cyan-400 text-slate-950 py-3.5 text-sm font-black disabled:opacity-40"
                  >
                    Continuar al pago
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
      {paymentOpen && cart && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md grid place-items-center p-4">
          <div className="liquid-glass rounded-3xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setPaymentOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
            <h2 className="text-2xl font-black">Confirmar pago</h2>
            <p className="text-sm text-slate-400 mt-1">
              Total a pagar:{" "}
              <strong className="text-cyan-300">
                {formatPrice(cart.total, currency)}
              </strong>
            </p>
            <div className="space-y-3 mt-6">
              <label className="text-xs text-slate-300">
                Método de pago
                <select
                  value={paymentMethod}
                  onChange={event => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-3 text-sm"
                >
                  <option value="card">Tarjeta débito o crédito</option>
                  <option value="pse">PSE</option>
                  <option value="cash">Pago en taquilla</option>
                </select>
              </label>
              {paymentMethod === "card" && (
                <input
                  placeholder="Número de tarjeta de prueba"
                  className="liquid-glass-input w-full rounded-xl px-3 py-3 text-sm"
                />
              )}
            </div>
            <button
              onClick={confirmPayment}
              disabled={updating}
              className="mt-6 w-full rounded-xl bg-cyan-400 text-slate-950 py-3 font-black"
            >
              {updating ? "Procesando..." : "Pagar y confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
