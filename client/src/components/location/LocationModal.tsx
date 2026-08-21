import { useState } from "react";
import { X, MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CountrySelector } from "./CountrySelector";
import { DepartmentSelector } from "./DepartamentSelector";
import { CitySelector } from "./CitySelector";
import { ConfirmButton } from "./ConfirmButton";
import { useLocation } from "./useLocation";
import { getCurrencyForCountry } from "./currencies";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal de selección de ubicación con diseño liquid-glass. Solo se cierra
// cuando hay una ciudad confirmada (o al pulsar la X / cancelar).
export function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { selection, setCountry, setDepartment, setCity, confirmLocation, isComplete } = useLocation();

  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = (): void => {
    const success = confirmLocation();
    if (!success) {
      setValidationMessage(
        "Debes seleccionar país, departamento y ciudad antes de continuar."
      );
      return;
    }
    setValidationMessage(null);
    onClose();
  };

  const currency = getCurrencyForCountry(selection.country);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="liquid-glass w-full max-w-md rounded-3xl p-6 md:p-8 relative border border-cyan-500/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <MapPin className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              ¿Dónde quieres ver tu película?
            </h3>
            <p className="text-xs text-slate-400">
              Selecciona tu ubicación para mostrar la cartelera y el precio en la moneda de tu país.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <CountrySelector value={selection.country} onChange={setCountry} />

          <DepartmentSelector
            country={selection.country}
            value={selection.department}
            onChange={setDepartment}
          />

          <CitySelector
            country={selection.country}
            department={selection.department}
            value={selection.city}
            onChange={setCity}
          />
        </div>

        {selection.country && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Los precios se mostrarán en{" "}
              <strong className="text-white">{currency.code}</strong> para {selection.country}.
            </span>
          </div>
        )}

        {validationMessage && (
          <p className="text-rose-400 text-xs mt-4 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{validationMessage}</span>
          </p>
        )}

        <div className="mt-6">
          <ConfirmButton disabled={!isComplete} onConfirm={handleConfirm} />
        </div>
      </div>
    </div>
  );
}
