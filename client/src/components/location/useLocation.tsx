import { useEffect, useState } from "react";
import type { LocationSelection } from "./interface";

const STORAGE_KEY = "cineclub_location";

interface LocationState {
  selection: LocationSelection;
  confirmedCity: string | null;
}

function readStored(): LocationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const country = parsed.country ?? null;
        const department = parsed.department ?? null;
        const city = parsed.city ?? null;
        return {
          selection: { country, department, city },
          confirmedCity: city,
        };
      }
    }
  } catch {
    /* localStorage dañado/indisponible: usamos estado vacío */
  }
  return {
    selection: { country: null, department: null, city: null },
    confirmedCity: null,
  };
}

// Store compartido entre CinemaHome y LocationModal: cualquier cambio
// notifica a todos los componentes suscritos (patrón subscribe simple).
let state: LocationState = readStored();
const listeners = new Set<() => void>();

function setState(next: LocationState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function useLocation() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    selection: state.selection,
    confirmedCity: state.confirmedCity,

    setCountry(country: string) {
      setState({
        selection: { country, department: null, city: null },
        confirmedCity: null,
      });
    },

    setDepartment(department: string) {
      setState({
        selection: { ...state.selection, department, city: null },
        confirmedCity: null,
      });
    },

    setCity(city: string) {
      setState({
        selection: { ...state.selection, city },
        confirmedCity: null,
      });
    },

    confirmLocation(): boolean {
      const { country, department, city } = state.selection;
      if (!country || !department || !city) {
        return false;
      }
      const seleccion: LocationSelection = { country, department, city };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seleccion));
      } catch {
        /* sin persistencia, la ubicación sigue siendo válida en memoria */
      }
      setState({ selection: seleccion, confirmedCity: city });
      return true;
    },

    isComplete: state.selection.country !== null && state.selection.department !== null && state.selection.city !== null,
  };
}
