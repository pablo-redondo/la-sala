export const revalidate = 3600

import { discoverMovies, getTopRatedMovies, getTrendingMovies } from '@/services/tmdb'
import TmdbCarousel from '@/components/TmdbCarousel'
import Link from 'next/link'

export default async function MoviesPage() {
  const [trending, topRated, scifi, thriller, animation, action, drama, horror, romance] = await Promise.all([
    getTrendingMovies(),
    getTopRatedMovies(),
    discoverMovies({ with_genres: '878', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverMovies({ with_genres: '53', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverMovies({ with_genres: '16', sort_by: 'popularity.desc', 'vote_count.gte': '50' }),
    discoverMovies({ with_genres: '28', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverMovies({ with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': '1000' }),
    discoverMovies({ with_genres: '27', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverMovies({ with_genres: '10749', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
  ])

  const f = (r: { results: import('@/services/tmdb').TmdbMovieResult[] }) =>
    r.results.filter(m => m.poster_path).slice(0, 16)

  const genres = [
    { label: 'Sci-Fi', href: '/discover?genre=878&type=movie' },
    { label: 'Thriller', href: '/discover?genre=53&type=movie' },
    { label: 'Comedia', href: '/discover?genre=35&type=movie' },
    { label: 'Animación', href: '/discover?genre=16&type=movie' },
    { label: 'Terror', href: '/discover?genre=27&type=movie' },
    { label: 'Drama', href: '/discover?genre=18&type=movie' },
    { label: 'Acción', href: '/discover?genre=28&type=movie' },
    { label: 'Romance', href: '/discover?genre=10749&type=movie' },
  ]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Compact header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="page-inner" style={{ paddingTop: 28, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.4vw, 36px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>Películas</h1>
              <p style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>Explora por género o descubre las más populares</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {genres.map(g => (
                <Link key={g.href} href={g.href} className="pill-link" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 999, textDecoration: 'none', transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out), color .2s' }}>
                  {g.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 40, paddingBottom: 64, display: 'flex', flexDirection: 'column', gap: 52 }}>
        <TmdbCarousel items={trending.slice(0, 16)} title="Tendencias esta semana" subtitle="Lo más visto ahora mismo" type="movie" viewAllHref="/discover?sort=popularity.desc&type=movie" />
        <TmdbCarousel items={topRated.slice(0, 16)} title="Mejor valoradas de la historia" subtitle="Las más aclamadas de todos los tiempos" type="movie" viewAllHref="/top#movies" />
        <TmdbCarousel items={f(action)} title="Acción & Aventura" type="movie" viewAllHref="/discover?genre=28&type=movie" />
        <TmdbCarousel items={f(scifi)} title="Ciencia Ficción" subtitle="Viajes al futuro y más allá" type="movie" viewAllHref="/discover?genre=878&type=movie" />
        <TmdbCarousel items={f(thriller)} title="Thriller & Suspense" subtitle="Suspenso hasta el final" type="movie" viewAllHref="/discover?genre=53&type=movie" />
        <TmdbCarousel items={f(drama)} title="Drama" subtitle="Historias que te harán reflexionar" type="movie" viewAllHref="/discover?genre=18&type=movie" />
        <TmdbCarousel items={f(horror)} title="Terror" type="movie" viewAllHref="/discover?genre=27&type=movie" />
        <TmdbCarousel items={f(animation)} title="Animación" subtitle="Para todas las edades" type="movie" viewAllHref="/discover?genre=16&type=movie" />
        <TmdbCarousel items={f(romance)} title="Romance" type="movie" viewAllHref="/discover?genre=10749&type=movie" />
      </div>

      <style>{`
        .pill-link:hover { background: rgba(139,92,246,0.2) !important; border-color: rgba(139,92,246,0.4) !important; color: var(--text) !important; }
      `}</style>
    </div>
  )
}
