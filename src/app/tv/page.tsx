export const revalidate = 3600

import { discoverTV, getTopRatedTV, getTrendingTV, getTVAiringToday, getTVOnTheAir } from '@/services/tmdb'
import TmdbCarousel from '@/components/TmdbCarousel'
import Link from 'next/link'

export default async function TVPage() {
  const [trending, topRated, crime, comedy, scifi, drama, action, airingToday, onTheAir, documentary] = await Promise.all([
    getTrendingTV(),
    getTopRatedTV(),
    discoverTV({ with_genres: '80', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverTV({ with_genres: '35', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverTV({ with_genres: '10765', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverTV({ with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': '500' }),
    discoverTV({ with_genres: '10759', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    getTVAiringToday(),
    getTVOnTheAir(),
    discoverTV({ with_genres: '99', sort_by: 'popularity.desc', 'vote_count.gte': '50' }),
  ])

  const f = (r: { results: import('@/services/tmdb').TmdbMovieResult[] }) =>
    r.results.filter(m => m.poster_path).slice(0, 16)

  const genres = [
    { label: 'Crimen', href: '/discover?genre=80&type=tv' },
    { label: 'Comedia', href: '/discover?genre=35&type=tv' },
    { label: 'Sci-Fi', href: '/discover?genre=10765&type=tv' },
    { label: 'Drama', href: '/discover?genre=18&type=tv' },
    { label: 'Acción', href: '/discover?genre=10759&type=tv' },
    { label: 'Documental', href: '/discover?genre=99&type=tv' },
  ]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Compact header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="page-inner" style={{ paddingTop: 28, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.8px', lineHeight: 1 }}>Series</h1>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>Explora por género o descubre las más populares</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {genres.map(g => (
                <Link key={g.href} href={g.href} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 4, textDecoration: 'none' }}>
                  {g.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 28, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {airingToday.filter(s => s.poster_path).length > 0 && (
          <TmdbCarousel items={airingToday.filter(s => s.poster_path).slice(0, 16)} title="Hoy en emisión" subtitle="Episodios que se emiten hoy" type="tv" />
        )}
        {onTheAir.filter(s => s.poster_path).length > 0 && (
          <TmdbCarousel items={onTheAir.filter(s => s.poster_path).slice(0, 16)} title="En emisión actualmente" subtitle="Series con nuevos episodios esta semana" type="tv" />
        )}
        <TmdbCarousel items={trending.slice(0, 16)} title="Tendencias esta semana" subtitle="Los shows del momento" type="tv" viewAllHref="/discover?sort=popularity.desc&type=tv" />
        <TmdbCarousel items={topRated.slice(0, 16)} title="Mejores series de la historia" subtitle="Las más aclamadas de todos los tiempos" type="tv" viewAllHref="/top#tv" />
        <TmdbCarousel items={f(crime)} title="Crimen & Misterio" subtitle="Intriga y suspense hasta el final" type="tv" viewAllHref="/discover?genre=80&type=tv" />
        <TmdbCarousel items={f(action)} title="Acción & Aventura" type="tv" viewAllHref="/discover?genre=10759&type=tv" />
        <TmdbCarousel items={f(scifi)} title="Ciencia Ficción & Fantasía" subtitle="Mundos más allá de la imaginación" type="tv" viewAllHref="/discover?genre=10765&type=tv" />
        <TmdbCarousel items={f(drama)} title="Drama" subtitle="Historias que no olvidarás" type="tv" viewAllHref="/discover?genre=18&type=tv" />
        <TmdbCarousel items={f(comedy)} title="Comedia" subtitle="Para reír sin parar" type="tv" viewAllHref="/discover?genre=35&type=tv" />
        <TmdbCarousel items={f(documentary)} title="Documentales" type="tv" viewAllHref="/discover?genre=99&type=tv" />
      </div>
    </div>
  )
}
