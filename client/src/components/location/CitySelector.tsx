import { useEffect, useState } from "react";
import { fetchCities } from "./locationApi";
import type { City } from "./interface";

interface CitySelectorProps {
  country: string | null;
  department: string | null;
  value: string | null;
  onChange: (city: string) => void;
}

export function CitySelector({ country, department, value, onChange }: CitySelectorProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!country || !department) {
      setCities([]);
      return;
    }

    const cargarCiudades = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCities(country, department);
        setCities(data);
      } catch (err) {
        setError("Ocurrió un error cargando las ciudades");
      } finally {
        setLoading(false);
      }
    };

    cargarCiudades();
  }, [country, department]);

  const ciudadesActivas = cities.filter((ciudad) => ciudad.active === true);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="city" className="text-xs font-medium text-slate-300">
        Ciudad
      </label>
      <select
        id="city"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={!department || loading}
        className="liquid-glass-input w-full px-4 py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          {!department
            ? "Primero selecciona un departamento"
            : loading
              ? "Cargando ciudades..."
              : "Selecciona una ciudad"}
        </option>
        {ciudadesActivas.map((city) => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
      {!loading && department && ciudadesActivas.length === 0 && error === "" && (
        <p className="text-slate-400 text-xs">
          No hay ciudades con cines disponibles en este departamento.
        </p>
      )}
      {error !== "" && <p className="text-rose-400 text-xs">{error}</p>}
    </div>
  );
}
