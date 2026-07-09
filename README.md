# 🎬 La Sala

**La Sala** es un explorador de películas y series construido sobre la API de [TMDB](https://www.themoviedb.org/). Permite navegar tendencias, descubrir por género, ver fichas detalladas (reparto, tráilers, dónde ver en streaming, sagas relacionadas) y guardar títulos en una watchlist local, todo con una interfaz de cine oscuro y cálido.

**[→ Ver demo en vivo](https://tu-proyecto.vercel.app)** <!-- TODO: sustituir por la URL real de Vercel -->

![Placeholder — Home](https://placehold.co/1200x650/0d0b08/d4982a?text=Home+%E2%80%94+Hero+%2B+carruseles)
![Placeholder — Ficha de película](https://placehold.co/1200x650/0d0b08/d4982a?text=Ficha+de+pel%C3%ADcula)
![Placeholder — Descubrir](https://placehold.co/1200x650/0d0b08/d4982a?text=Descubrir+con+filtros)

> Las imágenes de arriba son placeholders. Sustitúyelas por capturas reales en `/public/screenshots` y actualiza las rutas antes de publicar.

---

## Por qué existe este proyecto

Quería un proyecto personal que me obligara a trabajar con una API pública real y no trivial (TMDB, con su cascada de endpoints anidados: detalle → créditos → proveedores → recomendaciones), y que sirviera de excusa para aprender el App Router de Next.js a fondo — Server Components, streaming de datos, caché por ruta, rutas dinámicas anidadas — en lugar de montar otro CRUD con SPA + REST.

## Stack técnico

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Server Components por defecto: las páginas de ficha/catálogo hacen fetch de datos en el servidor sin exponer API keys al cliente ni enviar JS de más. |
| UI | **React 19** + TypeScript | Tipado estricto sobre las respuestas de TMDB/OMDb (`src/types`), evita errores de "propiedad no existe" con APIs externas con forma inconsistente. |
| Estilos | **Tailwind CSS 4** + CSS custom properties | Paleta y tipografía centralizadas en `globals.css` (`--bg`, `--accent`, `--font-*`) para mantener consistencia visual sin un sistema de diseño pesado. |
| Datos | **TMDB API** (principal) + **OMDb API** (rutas heredadas por IMDb ID) | TMDB da catálogo, imágenes, reparto y streaming providers en un solo lugar; OMDb se mantiene para las páginas `/movie/[id]` y `/tv/[id]` originales del proyecto. |
| Persistencia local | `localStorage` (sin backend) | La watchlist es un dato puramente del dispositivo del usuario — no hay cuentas ni servidor de estado, así que un backend habría sido sobre-ingeniería. |
| Tests | **Vitest** + Testing Library | Ver sección [Tests](#tests). |

### Patrón de fetching de datos

Todo el fetching a APIs externas ocurre **en el servidor**, dentro de Server Components (`async function Page()`), usando el `fetch` nativo con la caché de datos de Next.js:

```ts
// src/lib/tmdb.ts
const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
```

Esto significa:
- Las claves de API (`TMDB_API_KEY`, `OMDB_API_KEY`) **nunca llegan al navegador**.
- Cada ruta declara su propia política de revalidación (`export const revalidate = 3600`), así que el catálogo se refresca cada hora sin necesidad de un cron ni de invalidación manual.
- Las páginas con parámetros de usuario (búsqueda, descubrir con filtros) se marcan `dynamic` y se renderizan bajo demanda; el resto se sirve como HTML estático regenerado (ISR).
- No hay una capa de fetching en cliente (no `useEffect` + `fetch`, no React Query) porque no hace falta: no hay datos que cambien tras la carga inicial de la página salvo la watchlist, que vive enteramente en `localStorage` y se hidrata en el cliente con un `useEffect` puntual.

## Features

- 🏠 **Home** con hero rotativo de tendencias y carruseles temáticos (acción, sci-fi, terror, animación...)
- 🎞️ **Catálogo de películas y series** filtrable por género
- 🔍 **Búsqueda multi-tipo** (películas, series y personas) contra TMDB
- 🧭 **Descubrir** con filtros combinables (género, orden, tipo)
- 📅 **Estrenos** agrupados por mes / en cartelera
- 📺 **Streaming**: qué está disponible en plataformas (Netflix, Prime, etc.) vía TMDB `watch/providers`
- 🏆 **Top** — rankings de mejor valoradas con podio destacado
- 🎬 **Fichas de detalle** completas: sinopsis, reparto, tráiler embebido, temporadas (series), sagas relacionadas (colecciones), galería de imágenes, reseñas
- 👤 **Ficha de persona** (actor/director) con filmografía
- ❤️ **Watchlist local** — sin cuenta ni backend, persistida en `localStorage`

## Instalación local

```bash
git clone <url-del-repo>
cd cinescope
npm install
```

Copia `.env.example` a `.env.local` y rellena tus claves:

```bash
cp .env.example .env.local
```

```env
TMDB_API_KEY=tu_clave_de_tmdb
OMDB_API_KEY=tu_clave_de_omdb
```

- Clave de TMDB (gratuita): https://www.themoviedb.org/settings/api
- Clave de OMDb (gratuita): https://www.omdbapi.com/apikey.aspx

Arranca el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Otros scripts

```bash
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint     # ESLint
npm test        # suite de Vitest
```

## Tests

El proyecto incluye una suite mínima con **Vitest + Testing Library** que cubre la lógica más propensa a romperse silenciosamente: la persistencia de la watchlist en `localStorage`.

| Archivo | Qué cubre | Por qué importa |
|---|---|---|
| `src/lib/tmdb-watchlist.test.ts` | Añadir/quitar/consultar ítems, no duplicar, distinguir `movie` vs `tv` con el mismo id | Es el único estado mutable de la app fuera del servidor. Dos componentes distintos (`TmdbWatchlistButton`, `WatchlistClient`) dependen de que esta lógica sea correcta; un bug aquí corrompe silenciosamente los datos guardados del usuario sin que ningún error se muestre en pantalla. |
| `src/lib/omdb.test.ts` | `normalizePoster` mapea el placeholder `'N/A'` de OMDb a `null` | Es un límite con datos externos poco fiables — si se deja de normalizar, la UI intenta renderizar `<Image src="N/A">` y rompe la página entera en vez de mostrar un icono de fallback. |
| `src/components/TmdbWatchlistButton.test.tsx` | El botón cambia de label y persiste el cambio al hacer click, y revierte en un segundo click | Verifica el comportamiento de cara al usuario (no solo la lógica interna) — confirma que la UI y el `localStorage` quedan sincronizados tras la interacción real. |

Ejecutar:

```bash
npm test
```

## Estructura del proyecto

```
src/
├── app/                  # Rutas (App Router)
│   ├── tmdb/             # Rutas "nativas" TMDB (ficha por tmdb id, temporadas, colecciones)
│   ├── movie/[id]/       # Ficha heredada por IMDb id (OMDb)
│   ├── tv/[id]/          # Ficha heredada por IMDb id (OMDb)
│   ├── discover/, estrenos/, streaming/, top/, search/, watchlist/, person/[id]/
├── components/           # Componentes de UI (Navbar, Footer, carruseles, hero, botones)
├── lib/                  # Clientes HTTP (tmdb.ts, omdb.ts) y persistencia local (watchlist)
├── services/             # Lógica de negocio sobre los clientes HTTP (tmdb.ts, movies.ts, tv.ts)
└── types/                # Tipos de las respuestas de TMDB/OMDb
```

## Decisiones técnicas relevantes

- **¿Por qué Next.js y no una SPA con Vite?** El catálogo necesita SEO (páginas de ficha indexables) y las claves de API no pueden vivir en el cliente. App Router resuelve ambas cosas sin backend propio.
- **¿Por qué conviven TMDB y OMDb?** El proyecto empezó sobre OMDb (por IMDb ID); al migrar a TMDB por su cobertura de streaming providers, reparto y colecciones, se mantuvieron las rutas antiguas (`/movie/[id]`, `/tv/[id]`) para no romper enlaces existentes, mientras el catálogo nuevo vive bajo `/tmdb/*`.
- **¿Por qué `localStorage` y no una base de datos?** No hay autenticación de usuarios; añadir una BD y auth solo para una lista de favoritos habría sido complejidad sin beneficio real para un proyecto de portfolio de este alcance.
- **Streaming providers vía TMDB, no scraping**: se usa el endpoint oficial `watch/providers` en vez de scrapear catálogos de plataformas, que cambian sin aviso y violarían términos de servicio.

## Créditos de datos

Este producto usa la API de [TMDB](https://www.themoviedb.org/) y de [OMDb](https://www.omdbapi.com/) pero no está avalado ni certificado por ninguna de las dos.
