import { useEffect, useState } from "react";
import { fetchDepartments, cleanStateName } from "./locationApi";
import type { Department } from "./interface";

interface DepartmentSelectorProps {
  country: string | null;
  value: string | null;
  onChange: (department: string) => void;
}

export function DepartmentSelector({ country, value, onChange }: DepartmentSelectorProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!country) {
      setDepartments([]);
      return;
    }

    const cargarDepartamentos = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchDepartments(country);
        setDepartments(data);
      } catch (err) {
        setError("Ocurrió un error cargando los departamentos");
      } finally {
        setLoading(false);
      }
    };

    cargarDepartamentos();
  }, [country]);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="department" className="text-xs font-medium text-slate-300">
        Departamento / Estado
      </label>
      <select
        id="department"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={!country || loading}
        className="liquid-glass-input w-full px-4 py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled>
          {!country
            ? "Primero selecciona un país"
            : loading
              ? "Cargando departamentos..."
              : "Selecciona un departamento"}
        </option>
        {departments.map((department) => (
          <option key={department.code} value={department.name}>
            {cleanStateName(department.name)}
          </option>
        ))}
      </select>
      {error !== "" && <p className="text-rose-400 text-xs">{error}</p>}
    </div>
  );
}
