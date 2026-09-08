# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager: `pnpm` (this repo has a `pnpm-workspace.yaml`; a `package-lock.json` also exists but `pnpm-lock.yaml` is the one that matters).

```bash
pnpm install       # first run — node_modules is not checked in
pnpm dev           # start dev server on http://localhost:3000
pnpm build         # production build
pnpm start         # run a production build
pnpm lint          # eslint (flat config, eslint-config-next core-web-vitals + typescript)
```

There is no test suite configured in this repo.

### Required environment variables

Set these in `.env.local` (no `.env.example` exists yet):

- `TMDB_API_KEY` — required for all TMDB-backed routes/services.
- `TMDB_BASE_URL` — optional, defaults to `https://api.themoviedb.org/3`.
- `OMDB_API_KEY` — required for all OMDb-backed routes/services; without it `omdbFetch` degrades gracefully and returns `{ Response: 'False' }`.

## Architecture

This is a Next.js App Router project (`src/app`) using React 19 and Tailwind v4. Read `AGENTS.md` first — this project pins a Next.js version ahead of training-data knowledge, and its API/conventions can differ from what you expect; check `node_modules/next/dist/docs/` (after `pnpm install`) before relying on assumptions about routing, data fetching, or config.

### Two parallel data sources, not yet unified

The app was originally built on OMDb (keyed by IMDb ID, e.g. `tt1375666`) and is being migrated to TMDB (keyed by numeric TMDB ID). Both stacks are live simultaneously — check which one a given route uses before touching it:

- **OMDb stack** (legacy): `src/lib/omdb.ts` (raw fetch wrapper) → `src/services/movies.ts` (normalizes `OmdbDetail`/`OmdbSearchItem` into `MediaItem`) → pages like `src/app/movie/[id]/page.tsx`, `src/app/movies/page.tsx`, `src/app/search/page.tsx`, `src/app/watchlist/page.tsx`. IDs are IMDb IDs. Curated home-page rows are hardcoded IMDb-ID lists in `src/lib/curated.ts` (`CURATED_MOVIES`, `CURATED_CLASSIC_MOVIES`, etc.) and are fetched via `getMoviesByIds`.
- **TMDB stack** (current direction): `src/lib/tmdb.ts` (raw fetch wrapper, forces `language=es-ES`) → `src/services/tmdb.ts` and `src/services/tv.ts` (typed helpers: `discoverMovies`, `getTmdbMovieDetail`, `getPersonDetail`, `multiSearch`, etc.) → pages under `src/app/tmdb/`, `src/app/discover/`, `src/app/top/`, `src/app/streaming/`, `src/app/tv/`, `src/app/person/[id]/`. IDs are TMDB numeric IDs.
- `src/services/tmdb.ts` also bridges the two: `getMovieEnhancement(imdbId)` / `getTVEnhancement(imdbId)` call TMDB's `/find/{imdb_id}` endpoint to enrich an OMDb-sourced page (cast, trailer, similar titles, watch providers) without changing that page's IMDb-ID identity.

### Two parallel watchlists

Same split applies to the watchlist feature — both persist to `localStorage` client-side (no backend/DB in this project) and are not reconciled:

- `src/lib/watchlist.ts` — key `lasala_watchlist`, stores full `OmdbDetail` objects keyed by `imdbID`. Used with `WatchlistButton.tsx` / `WatchlistClient.tsx`.
- `src/lib/tmdb-watchlist.ts` — key `tmdb_watchlist`, stores lightweight `TmdbWatchlistItem` objects keyed by `(tmdbId, type)`. Used with `TmdbWatchlistButton.tsx`.

### Images

Both TMDB (`image.tmdb.org`) and OMDb (`m.media-amazon.com`) poster URLs are whitelisted in `next.config.ts` under `images.remotePatterns` — add new external image hosts there if the data sources change.

### Styling

Tailwind v4 (`@import "tailwindcss"` in `src/app/globals.css`, no `tailwind.config` file) layered with a hand-rolled CSS custom-property design system defined in `:root` in `globals.css` — a "warm cinema" dark palette (`--bg`, `--surface*`, `--accent`, `--text*`) plus three custom fonts loaded via `next/font/google` in `src/app/layout.tsx` (Bebas Neue, Playfair Display, Space Grotesk, exposed as `--font-bebas`/`--font-playfair`/`--font-space`). Prefer the existing CSS variables over new hardcoded colors/fonts.

### Data fetching pattern

All TMDB/OMDb calls go through `safeTmdbFetch`/`omdbFetch`-style wrappers that swallow errors and return `null` (or a `Response: 'False'` sentinel for OMDb) rather than throwing, so pages generally render empty states instead of crashing on API failures. Follow this pattern for new data-fetching helpers rather than letting fetch errors propagate to the page. Fetches use Next's `fetch(..., { next: { revalidate: 3600 } })` for time-based caching — respect that convention for new endpoints unless a route needs different freshness.
