import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sparkles,
  Ticket,
  Languages,
  MapPin,
  LifeBuoy,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { LocationModal } from "./location/LocationModal";
import { SupportModal } from "./SupportModal";
import { useLocation as useCinemaLocation } from "./location/useLocation";
import iconLogo from "../assets/icon.png";

export interface NavbarProps {
  currentPage?: "cinema" | "upcoming" | "cart" | "other";
  activeTab?: "catalog" | "bookings";
  onSelectTab?: (tab: "catalog" | "bookings") => void;
  bookingsCount?: number;
  language?: "es" | "en";
  onLanguageChange?: (lang: "es" | "en") => void;
}

export function Navbar({
  currentPage = "cinema",
  activeTab = "catalog",
  onSelectTab,
  bookingsCount: propBookingsCount,
  language: propLanguage,
  onLanguageChange,
}: NavbarProps) {
  const [, setLocation] = useLocation();
  const locationStore = useCinemaLocation();

  const [user, setUser] = useState<any>(null);
  const [internalBookingsCount, setInternalBookingsCount] = useState<number>(0);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const [language, setLanguage] = useState<"es" | "en">(() => {
    if (propLanguage) return propLanguage;
    return localStorage.getItem("cinema_language") === "en" ? "en" : "es";
  });

  useEffect(() => {
    if (propLanguage && propLanguage !== language) {
      setLanguage(propLanguage);
    }
  }, [propLanguage]);

  useEffect(() => {
    const handleStorageChange = () => {
      const current = localStorage.getItem("cinema_language") === "en" ? "en" : "es";
      setLanguage(current);
    };
    window.addEventListener("cinema_language_change", handleStorageChange);
    return () => window.removeEventListener("cinema_language_change", handleStorageChange);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "es" ? "en" : "es";
    setLanguage(newLang);
    localStorage.setItem("cinema_language", newLang);
    window.dispatchEvent(new Event("cinema_language_change"));
    onLanguageChange?.(newLang);
  };

  useEffect(() => {
    const stored = localStorage.getItem("cinema_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (propBookingsCount !== undefined) {
      setInternalBookingsCount(propBookingsCount);
      return;
    }
    fetch("/api/bookings")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const stored = localStorage.getItem("cinema_user");
          const currentUser = stored ? JSON.parse(stored) : null;
          const count = data.filter((b: any) => b.userEmail === currentUser?.email).length;
          setInternalBookingsCount(count);
        }
      })
      .catch(() => {});
  }, [propBookingsCount]);

  const handleLogout = () => {
    localStorage.removeItem("cinema_user");
    setLocation("/login");
  };

  const copy =
    language === "es"
      ? {
          billboard: "Cartelera",
          upcoming: "Próximos Estrenos",
          bookings: "Mis Reservas",
          cart: "Carrito",
          location: "Ubicación",
          support: "Soporte",
          logout: "Cerrar sesión",
          subtitle: "Cartelera IMAX & Líquida",
        }
      : {
          billboard: "Now Showing",
          upcoming: "Coming Soon",
          bookings: "My Bookings",
          cart: "Cart",
          location: "Location",
          support: "Support",
          logout: "Log out",
          subtitle: "IMAX & Liquid Cinema",
        };

  const handleBrandClick = () => {
    if (currentPage === "cinema" && onSelectTab) {
      onSelectTab("catalog");
    } else {
      setLocation("/cinema");
    }
  };

  const handleBillboardClick = () => {
    if (currentPage === "cinema" && onSelectTab) {
      onSelectTab("catalog");
    } else {
      setLocation("/cinema");
    }
  };

  const handleBookingsClick = () => {
    if (currentPage === "cinema" && onSelectTab) {
      onSelectTab("bookings");
    } else {
      setLocation("/cinema?tab=bookings");
    }
  };

  const bookingsCount = propBookingsCount !== undefined ? propBookingsCount : internalBookingsCount;

  return (
    <>
      <header className="sticky top-0 z-40 liquid-glass border-b border-white/10 backdrop-blur-xl relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand Wordmark */}
          <div
            onClick={handleBrandClick}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0 select-none py-1"
            title="SilverScreen Home"
          >
            <img
              src={iconLogo}
              alt="SilverScreen Logo"
              className="h-10 sm:h-11 md:h-12 w-auto object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col justify-center">
              <div className="font-playfair font-black text-xl sm:text-2xl md:text-[26px] leading-none tracking-tight flex items-center drop-shadow-md">
                <span className="silver-metallic-text font-black">Silver</span>
                <span className="screen-cyan-text font-black">Screen</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-cyan-300/90 font-sans tracking-wider mt-0.5 sm:mt-1">
                {copy.subtitle}
              </p>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center space-x-1.5 sm:space-x-2 md:space-x-2.5 py-1">
            {/* Cartelera */}
            <button
              onClick={handleBillboardClick}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                currentPage === "cinema" && activeTab === "catalog"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {copy.billboard}
            </button>

            {/* Próximos Estrenos */}
            <button
              onClick={() => setLocation("/proximos-estrenos")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                currentPage === "upcoming"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-cyan-500/30"
              }`}
              title={copy.upcoming}
            >
              <Sparkles className={`w-3.5 h-3.5 ${currentPage === "upcoming" ? "text-white" : "text-cyan-400"}`} />
              <span className="hidden xs:inline sm:inline text-xs">{copy.upcoming}</span>
            </button>

            {/* Mis Reservas */}
            <button
              onClick={handleBookingsClick}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                currentPage === "cinema" && activeTab === "bookings"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="text-xs">{copy.bookings} {bookingsCount > 0 ? `(${bookingsCount})` : ""}</span>
            </button>

            {/* Carrito */}
            <button
              onClick={() => setLocation("/cart")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shrink-0 transition-all ${
                currentPage === "cart"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400"
                  : "water-btn"
              }`}
              title={copy.cart}
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${currentPage === "cart" ? "text-white" : "text-cyan-400"}`} />
              <span className="hidden xs:inline sm:inline text-xs">{copy.cart}</span>
            </button>

            {/* Selector de Idioma */}
            <button
              onClick={toggleLanguage}
              className="water-btn px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer shrink-0"
              title={language === "es" ? "Cambiar a inglés" : "Switch to Spanish"}
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs">{language === "es" ? "EN" : "ES"}</span>
            </button>

            {/* Selector de Ubicación */}
            <button
              onClick={() => setIsLocationOpen(true)}
              className="water-btn px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shrink-0"
              title={language === "es" ? "Seleccionar ubicación" : "Select location"}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[60px] sm:max-w-[90px] truncate text-xs">
                {locationStore.confirmedCity ||
                  locationStore.selection.city ||
                  copy.location}
              </span>
            </button>

            {/* Soporte */}
            <button
              onClick={() => setIsSupportOpen(true)}
              className="water-btn px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shrink-0"
              title={copy.support}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline text-xs">{copy.support}</span>
            </button>

            {/* Usuario */}
            <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-white/10 shrink-0">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                {user?.name?.[0] || "U"}
              </div>
              <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">
                {user?.name || "Usuario"}
              </span>
            </div>

            {/* Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/10 cursor-pointer shrink-0"
              title={copy.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 z-50 bg-[#0c1420] border-t border-white/10 px-4 pt-2 pb-6 shadow-xl">
            <div className="space-y-3">
              <button
                onClick={handleBillboardClick}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold text-left ${currentPage === "cinema" && activeTab === "catalog" ? 'bg-cyan-500 text-white' : 'text-slate-300'}`}
              >
                {copy.billboard}
              </button>

              <button
                onClick={() => setLocation("/proximos-estrenos")}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center space-x-3 ${currentPage === "upcoming" ? 'bg-cyan-500 text-white' : 'text-slate-300'}`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{copy.upcoming}</span>
              </button>

              <button
                onClick={handleBookingsClick}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center space-x-3 ${currentPage === "cinema" && activeTab === "bookings" ? 'bg-cyan-500 text-white' : 'text-slate-300'}`}
              >
                <Ticket className="w-4 h-4" />
                <span>{copy.bookings} {bookingsCount > 0 ? `(${bookingsCount})` : ""}</span>
              </button>

              <button
                onClick={() => setLocation("/cart")}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center space-x-3 ${currentPage === "cart" ? 'bg-cyan-500 text-white' : 'text-slate-300'}`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{copy.cart}</span>
              </button>

              <button
                onClick={toggleLanguage}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center space-x-3 text-slate-300"
              >
                <Languages className="w-4 h-4" />
                <span>{language === "es" ? "English (EN)" : "Español (ES)"}</span>
              </button>

              <button
                onClick={() => setIsLocationOpen(true)}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center space-x-3 text-slate-300"
              >
                <MapPin className="w-4 h-4" />
                <span className="truncate">
                  {locationStore.confirmedCity || locationStore.selection.city || copy.location}
                </span>
              </button>

              <button
                onClick={() => setIsSupportOpen(true)}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center space-x-3 text-slate-300"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>{copy.support}</span>
              </button>

              <div className="px-4 py-3 rounded-xl text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    {user?.name?.[0] || "U"}
                  </div>
                  <span className="font-medium text-slate-200 truncate">
                    {user?.name || "Usuario"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-left flex items-center space-x-3 text-slate-300"
              >
                <LogOut className="w-4 h-4" />
                <span>{copy.logout}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modales globales de navegación */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        userEmail={user?.email}
      />
    </>
  );
}
export default Navbar;
