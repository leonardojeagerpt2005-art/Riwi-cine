import { useEffect, useState } from "react";
import { fetchCountries } from "./locationApi";
import type { Country } from "./interface";

interface CountrySelectorProps {
  value: string | null;
  onChange: (country: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const cargarPaises = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCountries();
        setCountries(data);
      } catch (err) {
        setError("Ocurrió un error cargando los países");
      } finally {
        setLoading(false);
      }
    };

    cargarPaises();
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="country" className="text-xs font-medium text-slate-300">
        País
      </label>
      <select
        id="country"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="liquid-glass-input w-full px-4 py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          {loading ? "Cargando países..." : "Selecciona un país"}
        </option>
        {countries.map((country) => (
          <option key={country.name} value={country.name}>
            {country.name}
          </option>
        ))}
      </select>
      {error !== "" && <p className="text-rose-400 text-xs">{error}</p>}
    </div>
  );
}
