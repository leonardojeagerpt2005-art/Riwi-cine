import type { UpcomingMovie } from "./interface";

// Mock de películas para la sección de Próximamente ordenadas por fecha de estreno
export const MOCK_UPCOMING_MOVIES: UpcomingMovie[] = [
  {
    id: "solo-por-una-noche",
    title: "Solo Por Una Noche",
    posterUrl: "https://d11w3vv8f1cdqg.cloudfront.net/movies-poster/1778605136928-ONO_INTL_Social_4x5_RGB_LATAM_.jpg",
    genres: ["Comedia", "Romance"],
    trailerYoutubeId: "JPxELiF54B8",
    releaseDate: "2026-08-27",
    synopsis:
      "Dos personas con vidas totalmente opuestas coinciden en una cafetería de la ciudad a altas horas de la madrugada. Lo que inicia como una conversación casual se convierte en un viaje nocturno inolvidable de 12 horas donde cada decisión puede transformar su destino para siempre.",
    cast: ["Monica Barbaro", "Callum Turner", "Richard Jenkins", "Greta Lee"],
  },
  {
    id: "one-piece-la-pelicula",
    title: "One Piece: La Película",
    posterUrl: "https://dqq1cn0vfegag.cloudfront.net/movies-poster/1785360398133-OnePiece_2000_POSTER_70x100CPXCOL_.jpg",
    genres: ["Acción", "Aventura", "Comedia", "Animada", "Fantasía"],
    trailerYoutubeId: "yNAwlUkwMPI",
    releaseDate: "2026-09-10",
    synopsis:
      "Luffy y la tripulación de los Sombrero de Paja navegan hacia un archipiélago legendario envuelto en misterio donde una poderosa reliquia ancestral atrae a los piratas más peligrosos del Grand Line.",
    cast: ["Mayumi Tanaka", "Kazuya Nakai", "Akemi Okamura", "Kappei Yamaguchi"],
  },
  {
    id: "resident-evil-noche-cero",
    title: "Resident Evil: Noche Cero",
    posterUrl: "https://d1h560xa7cmqwq.cloudfront.net/movies-poster/1785360174983-Poster.jpg",
    genres: ["Acción", "Terror", "Suspenso"],
    trailerYoutubeId: "LgRq3PxVumU",
    releaseDate: "2026-09-17",
    synopsis:
      "En las primeras horas de una catástrofe biológica sin precedentes, un destacamento táctico queda aislado en una instalación secreta subterránea debiendo enfrentarse a criaturas mutantes para contener la propagación.",
    cast: ["Hannah John-Kamen", "Robbie Amell", "Kaya Scodelario", "Tom Hopper"],
  },
  {
    id: "street-fighter",
    title: "Street Fighter",
    posterUrl: "https://d11w3vv8f1cdqg.cloudfront.net/movies-poster/1782503377937-Poster_.jpg",
    genres: ["Acción", "Aventura", "Ciencia Ficción"],
    trailerYoutubeId: "wVKB0VmxLMY",
    releaseDate: "2026-10-15",
    synopsis:
      "Guerreros de artes marciales de élite de todo el globo compiten en el torneo definitivo organizado en las sombras por Shadaloo. Ryu y Chun-Li deberán superar sus propios límites para salvar a sus maestros.",
    cast: ["Simu Liu", "Lewis Tan", "Jessica Henwick", "Hiroyuki Sanada"],
  },
  {
    id: "avengers-doomsday",
    title: "Avengers: Doomsday",
    posterUrl: "https://d2gok2bmf4ckrg.cloudfront.net/movies-poster/1787334100712-avengers_.jpg",
    genres: ["Acción", "Aventura", "Ciencia Ficción"],
    trailerYoutubeId: "4ClliJ2DAZA",
    releaseDate: "2026-12-17",
    synopsis:
      "Los héroes más poderosos de la Tierra y sus aliados a través del multiverso deben unirse para enfrentar la mayor amenaza cósmica jamás vista: Victor von Doom, en una batalla crucial por la preservación de la realidad.",
    cast: ["Robert Downey Jr.", "Pedro Pascal", "Vanessa Kirby", "Joseph Quinn"],
  },
  {
    id: "jumanji-open-world",
    title: "Jumanji: Open World",
    posterUrl: "https://d11w3vv8f1cdqg.cloudfront.net/movies-poster/1786475589031-Poster.jpg",
    genres: ["Acción", "Aventura", "Comedia", "Ciencia Ficción"],
    trailerYoutubeId: "gksARXM2TVA",
    releaseDate: "2026-12-24",
    synopsis:
      "El juego de Jumanji evoluciona hacia una experiencia de mundo abierto masivo y peligroso. Los avatares deberán explorar territorios inexplorados, desbloquear nuevas habilidades y sobrevivir a misiones extremas para regresar a casa.",
    cast: ["Dwayne Johnson", "Kevin Hart", "Jack Black", "Karen Gillan"],
  },
  {
    id: "angry-birds-3-la-pelicula",
    title: "Angry Birds 3 La Película",
    posterUrl: "https://d1h560xa7cmqwq.cloudfront.net/movies-poster/1786472218140-AB3_INTL_1080x1350_Insta_Teaser_1Sht_Birds_LAS_.jpg",
    genres: ["Aventura", "Animada"],
    trailerYoutubeId: "qrDrff-rGJI",
    releaseDate: "2027-01-07",
    synopsis:
      "Una gran familia, un completo caos. Red, Chuck, Bomb y Silver regresan en una divertida travesía llena de plumas, nuevos personajes y disparatadas aventuras que pondrán a prueba su amistad y valentía.",
    cast: ["Jason Sudeikis", "Josh Gad", "Rachel Bloom", "Peter Dinklage"],
  },
  {
    id: "shrek-5",
    title: "Shrek 5",
    posterUrl: "https://d1h560xa7cmqwq.cloudfront.net/movies-poster/1785280431171-Poster.jpg",
    genres: ["Aventura", "Comedia", "Infantil", "Animada"],
    trailerYoutubeId: "Gnov4Qem6Uw",
    releaseDate: "2027-07-01",
    synopsis:
      "Shrek, Fiona, Burro y sus amigos regresan a Muy Muy Lejano para una nueva y emocionante aventura repleta de humor, romance y nuevos giros sobre los cuentos de hadas tradicionales.",
    cast: ["Mike Myers", "Eddie Murphy", "Cameron Diaz", "Antonio Banderas"],
  },
];
