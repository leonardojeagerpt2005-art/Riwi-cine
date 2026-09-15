// Tipado estricto para las películas de la sección de Próximos Estrenos

export interface UpcomingMovie {
  id: string;
  title: string;
  posterUrl: string;
  genres: string[];
  trailerYoutubeId: string;
  releaseDate: string; // Formato YYYY-MM-DD
  synopsis?: string;
  cast?: string[];
}
