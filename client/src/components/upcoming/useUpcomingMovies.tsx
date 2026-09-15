import { useState, useEffect, useCallback } from "react";
import type { UpcomingMovie } from "./interface";
import { MOCK_UPCOMING_MOVIES } from "./mockUpcomingMovies";

export function useUpcomingMovies() {
  const [movies, setMovies] = useState<UpcomingMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulación de llamada asíncrona a API con orden cronológico de estreno
    const timer = setTimeout(() => {
      try {
        const sorted = [...MOCK_UPCOMING_MOVIES].sort((a, b) =>
          a.releaseDate.localeCompare(b.releaseDate)
        );
        setMovies(sorted);
        setLoading(false);
      } catch {
        setError("Error al cargar las películas en próximamente.");
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Función para obtener una película por su ID
  const getMovieById = useCallback(
    (id: string): UpcomingMovie | undefined => {
      return MOCK_UPCOMING_MOVIES.find((movie) => movie.id === id);
    },
    []
  );

  return {
    movies,
    loading,
    error,
    getMovieById,
  };
}
