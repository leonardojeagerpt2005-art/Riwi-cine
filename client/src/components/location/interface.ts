// Tipado estricto de todo lo relacionado a ubicación (país, departamento, ciudad)

export interface Country {
  name: string;
  iso2: string; // código corto del país, ej: "CO"
}

export interface Department {
  name: string;
  code: string; // ej: state_code que devuelve la API
}

export interface City {
  name: string;
  active: boolean; // solo se muestran las ciudades activas (con cines disponibles)
}

// Selección completa de ubicación, lo que se guarda en localStorage
export interface LocationSelection {
  country: string | null;
  department: string | null;
  city: string | null;
}
