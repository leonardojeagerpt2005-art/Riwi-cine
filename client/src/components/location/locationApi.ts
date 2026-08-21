import type { City, Country, Department } from "./interface";

const BASE_URL = "https://countriesnow.space/api/v0.1/countries";

const SUPPORTED_COUNTRIES = [
  "Colombia",
  "Panama",
  "Panamá",
  "United States",
  "Mexico",
  "México",
  "Argentina",
];

const MAIN_DEPARTMENTS: Record<string, string[]> = {
  Colombia: [
    "Atlántico",
    "Atlantico",
    "Bogotá D.C.",
    "Bogota D.C.",
    "Antioquia",
    "Valle del Cauca",
    "Bolívar",
    "Bolivar",
    "Santander",
    "Cundinamarca",
  ],
  Panama: [
    "Panamá",
    "Panama",
    "Colón",
    "Colon",
    "Chiriquí",
    "Chiriqui",
    "Panamá Oeste",
    "Panama Oeste",
  ],
  Panamá: [
    "Panamá",
    "Panama",
    "Colón",
    "Colon",
    "Chiriquí",
    "Chiriqui",
    "Panamá Oeste",
    "Panama Oeste",
  ],
  "United States": [
    "California",
    "Texas",
    "Florida",
    "New York",
    "Illinois",
  ],
  // La API no trae "Ciudad de México" ni "Estado de México" como estados:
  // el estado es "Mexico City". Solo se dejan los que tienen ciudades.
  Mexico: ["Mexico City", "Jalisco", "Nuevo León", "Nuevo Leon"],
  México: ["Mexico City", "Jalisco", "Nuevo León", "Nuevo Leon"],
  // "Ciudad Autónoma de Buenos Aires" no trae ciudades en la API y su nombre
  // limpio se duplica con "Buenos Aires Province", por eso no se incluye.
  Argentina: [
    "Buenos Aires",
    "Córdoba",
    "Cordoba",
    "Santa Fe",
  ],
};

// Esto en el proyecto real vendría de la base de datos, pero como esta
// API no tiene esa info, la simulamos con una lista fija por país para
// evitar que una ciudad coincida por nombre con la de otro país.
const ACTIVE_CITIES: Record<string, string[]> = {
  Colombia: [
    "Barranquilla",
    "Bogotá",
    "Bogota",
    "Medellín",
    "Medellin",
    "Cali",
    "Cartagena",
    "Bucaramanga",
    "Cúcuta",
    "Popayán",
  ],
  Panama: [
    "Panama City",
    "Ciudad de Panamá",
    "Panamá",
    "Distrito de Panamá",
    "Colón",
    "Colon",
    "David",
    "La Chorrera",
    "Distrito de La Chorrera",
  ],
  Panamá: [
    "Panama City",
    "Ciudad de Panamá",
    "Panamá",
    "Distrito de Panamá",
    "Colón",
    "Colon",
    "David",
    "La Chorrera",
    "Distrito de La Chorrera",
  ],
  "United States": [
    "New York",
    "New York City",
    "Los Angeles",
    "Miami",
    "Chicago",
  ],
  Mexico: ["Ciudad de México", "Ciudad de Mexico", "Mexico City", "Guadalajara", "Monterrey"],
  México: ["Ciudad de México", "Ciudad de Mexico", "Mexico City", "Guadalajara", "Monterrey"],
  Argentina: ["Buenos Aires", "Córdoba", "Cordoba", "Santa Fe"],
};

// Normaliza un nombre de ciudad para compararlo sin tildes ni mayúsculas.
function normalizeCityName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Limpia el nombre de un departamento/estado para mostrarlo sin el sufijo
// que agrega la API ("Atlántico Department" -> "Atlántico").
export function cleanStateName(name: string): string {
  return normalizeStateName(name)
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

// Trae la lista de paises (ya filtrada solo con los que nos interesan)
export async function fetchCountries(): Promise<Country[]> {
  const response = await fetch(`${BASE_URL}/iso`);

  if (!response.ok) {
    throw new Error("No se pudo cargar la lista de paises");
  }

  const json = await response.json();

  const paises: Country[] = json.data
    .filter((pais: any) => SUPPORTED_COUNTRIES.includes(pais.name))
    .map((pais: any) => ({
      name: pais.name,
      iso2: pais.iso2,
    }));

  return paises;
}

// Normaliza un nombre de estado/departamento para compararlo sin
// acentos, sufijos ("Department", "Province", "State", etc.) ni espacios extra.
function normalizeStateName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(
      /\b(department|province|state|region|district|county|municipality|the)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

// Verdadero si un estado de la API coincide con un nombre de nuestra lista,
// aunque la API agregue sufijos o use tildes/ortografía distinta.
function stateMatches(desired: string, apiName: string): boolean {
  const d = normalizeStateName(desired);
  const s = normalizeStateName(apiName);
  if (!d || !s) return false;
  return d === s || s.includes(d) || d.includes(s);
}

// Trae los departamentos/estados de un pais. Usamos el endpoint GET directo
// ("/states/q") porque el POST redirige con 301 y el navegador lo convierte
// a GET, rompiendo la petición. Guardamos el nombre EXACTO de la API para
// que luego las ciudades se puedan consultar con ese mismo nombre.
export async function fetchDepartments(
  countryName: string
): Promise<Department[]> {
  const url = new URL(`${BASE_URL}/states/q`);
  url.searchParams.set("country", countryName);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("No se pudo cargar la lista de departamentos");
  }

  const json = await response.json();

  if (json.error || !json.data?.states) {
    throw new Error(json.msg || "No se pudo cargar la lista de departamentos");
  }

  // Filtramos para dejar solo los departamentos/estados principales de ese pais
  const departamentosPrincipales = MAIN_DEPARTMENTS[countryName] || [];

  const departamentos: Department[] = json.data.states
    .filter((estado: any) =>
      departamentosPrincipales.some((nombre) =>
        stateMatches(nombre, estado.name)
      )
    )
    .map((estado: any) => ({
      name: estado.name,
      code: estado.state_code,
    }));

  return departamentos;
}

// Trae las ciudades de un departamento, y les marca si estan activas o no.
// Igual que los estados, usamos el GET directo "/state/cities/q" y pasamos
// el nombre EXACTO del estado tal como lo devuelve la API.
export async function fetchCities(
  countryName: string,
  departmentName: string
): Promise<City[]> {
  const url = new URL(`${BASE_URL}/state/cities/q`);
  url.searchParams.set("country", countryName);
  url.searchParams.set("state", departmentName);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("No se pudo cargar la lista de ciudades");
  }

  const json = await response.json();

  if (json.error || !Array.isArray(json.data)) {
    throw new Error(json.msg || "No se pudo cargar la lista de ciudades");
  }

  const ciudadesActivas = ACTIVE_CITIES[countryName] || [];

  const ciudades: City[] = json.data.map((nombreCiudad: string) => ({
    name: nombreCiudad,
    active: ciudadesActivas.some(
      (activa) => normalizeCityName(activa) === normalizeCityName(nombreCiudad)
    ),
  }));

  return ciudades;
}
