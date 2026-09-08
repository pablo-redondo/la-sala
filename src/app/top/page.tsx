export const revalidate = 3600

import Image from 'next/image'
import Link from 'next/link'
import { getTopRatedMovies, getTopRatedTV, getTrendingMovies, discoverMovies, discoverTV, getPosterUrl } from '@/services/tmdb'
import TmdbCarousel from '@/components/TmdbCarousel'
import type { TmdbMovieResult } from '@/services/tmdb'

function PodiumCard({ item, rank, type }: { item: TmdbMovieResult; rank: number; type: 'movie' | 'tv' }) {
  const poster = getPosterUrl(item.poster_path, 'w342')
  const title = item.title ?? item.name ?? ''
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)
  const medal = rank === 1 ? { color: 'var(--gold)', glow: 'rgba(251,191,36,0.12)', num: '01' }
              : rank === 2 ? { color: '#94a3b8', glow: 'rgba(148,163,184,0.08)', num: '02' }
              : { color: '#c97c3e', glow: 'rgba(201,124,62,0.08)', num: '03' }

  return (
    <Link href={`/tmdb/${type}/${item.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px', borderRadius: 8, background: `linear-gradient(135deg, ${medal.glow}, transparent)`, border: `1px solid rgba(255,255,255,0.05)`, marginBottom: 4 }} className="top-row">
      <span style={{ fontSize: 10, fontWeight: 900, color: medal.color, fontVariantNumeric: 'tabular-nums', flexShrink: 0, width: 18, textAlign: 'right', opacity: 0.7, fontFamily: 'var(--font-ui)' }}>{medal.num}</span>
      <div style={{ width: 36, height: 54, borderRadius: 4, overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0, position: 'relative', boxShadow: `0 3px 10px rgba(0,0,0,0.5), 0 0 0 1px ${medal.color}22` }}>
        {poster && <Image src={poster} alt={title} fill sizes="36px" style={{ objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{title}</p>
        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{year}</p>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
        <span style={{ color: medal.color, fontSize: 9 }}>★</span>
        <span style={{ color: medal.color, fontWeight: 800, fontSize: 13 }}>{item.vote_average.toFixed(1)}</span>
      </div>
    </Link>
  )
}

function RankedRow({ item, rank, type }: { item: TmdbMovieResult; rank: number; type: 'movie' | 'tv' }) {
  const poster = getPosterUrl(item.poster_path, 'w185')
  const title = item.title ?? item.name ?? ''
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)

  return (
    <Link href={`/tmdb/${type}/${item.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }} className="top-row">
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', opacity: rank <= 10 ? 0.6 : 0.3, width: 22, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-ui)' }}>{rank}</span>
      <div style={{ width: 28, height: 42, borderRadius: 3, overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0, position: 'relative' }}>
        {poster && <Image src={poster} alt={title} fill sizes="28px" style={{ objectFit: 'cover' }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
        <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{year}</p>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
        <span style={{ color: 'var(--gold)', fontSize: 8 }}>★</span>
        <span style={{ color: 'var(--muted2)', fontWeight: 700, fontSize: 11 }}>{item.vote_average.toFixed(1)}</span>
      </div>
    </Link>
  )
}

function TopList({ items, type, limit = 20 }: { items: TmdbMovieResult[]; type: 'movie' | 'tv'; limit?: number }) {
  const top3 = items.slice(0, 3)
  const rest = items.slice(3, limit)
  return (
    <div>
      {top3.map((item, i) => <PodiumCard key={item.id} item={item} rank={i + 1} type={type} />)}
      <div style={{ marginTop: 2 }}>
        {rest.map((item, i) => <RankedRow key={item.id} item={item} rank={i + 4} type={type} />)}
      </div>
    </div>
  )
}

function MiniRankedRow({ item, rank, type }: { item: TmdbMovieResult; rank: number; type: 'movie' | 'tv' }) {
  const poster = getPosterUrl(item.poster_path, 'w185')
  const title = item.title ?? item.name ?? ''

  return (
    <Link href={`/tmdb/${type}/${item.id}`} style={{ textDecoration: 'none', display: 'flex', gap: 8, alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }} className="top-row">
      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', opacity: 0.4, width: 16, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{rank}</span>
      <div style={{ width: 24, height: 36, borderRadius: 3, overflow: 'hidden', background: 'var(--surface2)', flexShrink: 0, position: 'relative' }}>
        {poster && <Image src={poster} alt={title} fill sizes="24px" style={{ objectFit: 'cover' }} />}
      </div>
      <p style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
      <span style={{ color: 'var(--gold)', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>★ {item.vote_average.toFixed(1)}</span>
    </Link>
  )
}

function GenreTopList({ items, title, accentColor, href, type }: {
  items: TmdbMovieResult[]
  title: string
  accentColor: string
  href: string
  type: 'movie' | 'tv'
}) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 3, height: 12, background: accentColor, borderRadius: 2, flexShrink: 0 }} />
        <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', flex: 1 }}>{title}</h3>
        <Link href={href} style={{ fontSize: 9, color: 'var(--muted)', textDecoration: 'none', flexShrink: 0 }}>Ver más →</Link>
      </div>
      {items.slice(0, 8).map((item, i) => <MiniRankedRow key={item.id} item={item} rank={i + 1} type={type} />)}
    </div>
  )
}

export default async function TopPage() {
  const [
    moviesP1, moviesP2, tvP1, tvP2,
    trending,
    documentary, animation, scifi, thriller, comedy, horror,
    dramaTV, crimeTV,
  ] = await Promise.all([
    getTopRatedMovies(1), getTopRatedMovies(2),
    getTopRatedTV(1), getTopRatedTV(2),
    getTrendingMovies(),
    discoverMovies({ with_genres: '99', sort_by: 'vote_average.desc', 'vote_count.gte': '300' }),
    discoverMovies({ with_genres: '16', sort_by: 'vote_average.desc', 'vote_count.gte': '300' }),
    discoverMovies({ with_genres: '878', sort_by: 'vote_average.desc', 'vote_count.gte': '400' }),
    discoverMovies({ with_genres: '53', sort_by: 'vote_average.desc', 'vote_count.gte': '400' }),
    discoverMovies({ with_genres: '35', sort_by: 'vote_average.desc', 'vote_count.gte': '400' }),
    discoverMovies({ with_genres: '27', sort_by: 'vote_average.desc', 'vote_count.gte': '300' }),
    discoverTV({ with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': '500' }),
    discoverTV({ with_genres: '80', sort_by: 'vote_average.desc', 'vote_count.gte': '200' }),
  ])

  const movies = [...moviesP1, ...moviesP2].filter((m: TmdbMovieResult) => m.poster_path).slice(0, 50)
  const tvShows = [...tvP1, ...tvP2].filter((s: TmdbMovieResult) => s.poster_path).slice(0, 50)
  const trendingItems = trending.filter((m: TmdbMovieResult) => m.poster_path).slice(0, 20)

  const f = (d: { results: TmdbMovieResult[] }) => d.results.filter(m => m.poster_path)

  const GENRE_TOPS = [
    { title: 'Top Documentales', items: f(documentary), href: '/discover?genre=99&type=movie&sort=vote_average.desc', color: 'var(--violet)', type: 'movie' as const },
    { title: 'Top Animación', items: f(animation), href: '/discover?genre=16&type=movie&sort=vote_average.desc', color: 'var(--cyan)', type: 'movie' as const },
    { title: 'Top Ciencia Ficción', items: f(scifi), href: '/discover?genre=878&type=movie&sort=vote_average.desc', color: 'var(--pink)', type: 'movie' as const },
    { title: 'Top Thriller', items: f(thriller), href: '/discover?genre=53&type=movie&sort=vote_average.desc', color: 'var(--violet)', type: 'movie' as const },
    { title: 'Top Comedia', items: f(comedy), href: '/discover?genre=35&type=movie&sort=vote_average.desc', color: 'var(--cyan)', type: 'movie' as const },
    { title: 'Top Terror', items: f(horror), href: '/discover?genre=27&type=movie&sort=vote_average.desc', color: 'var(--pink)', type: 'movie' as const },
    { title: 'Top Drama (Series)', items: f(dramaTV), href: '/discover?genre=18&type=tv&sort=vote_average.desc', color: 'var(--violet)', type: 'tv' as const },
    { title: 'Top Crimen (Series)', items: f(crimeTV), href: '/discover?genre=80&type=tv&sort=vote_average.desc', color: 'var(--cyan)', type: 'tv' as const },
  ]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="page-inner" style={{ paddingTop: 28, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.4vw, 36px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>Lo mejor de <span className="text-gradient">todos los tiempos</span></h1>
              <p style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>Rankings basados en valoraciones de la comunidad TMDB</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Link href="#movies" className="pill-link" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 999, textDecoration: 'none', transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)' }}>Películas</Link>
              <Link href="#tv" className="pill-link" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 999, textDecoration: 'none', transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)' }}>Series</Link>
              <Link href="#generos" className="pill-link" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 999, textDecoration: 'none', transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)' }}>Géneros</Link>
              <Link href="#trending" className="pill-link" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 999, textDecoration: 'none', transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)' }}>Tendencias</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page-inner" style={{ paddingTop: 28, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 36 }}>

        {/* Movies + TV side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }} className="top-main-grid">

          <section id="movies">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 3, height: 14, background: 'var(--gradient)', borderRadius: 2 }} />
              <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Top Películas</h2>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{movies.length}</span>
              <Link href="/discover?sort=vote_average.desc&type=movie&rating=7" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>Ver todas →</Link>
            </div>
            <TopList items={movies} type="movie" limit={20} />
          </section>

          <section id="tv">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 3, height: 14, background: 'var(--gradient)', borderRadius: 2 }} />
              <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Top Series</h2>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{tvShows.length}</span>
              <Link href="/discover?sort=vote_average.desc&type=tv&rating=7" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>Ver todas →</Link>
            </div>
            <TopList items={tvShows} type="tv" limit={20} />
          </section>
        </div>

        {/* Genre tops: 4-col grid */}
        <section id="generos">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 3, height: 14, background: 'var(--gradient)', borderRadius: 2 }} />
            <h2 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Rankings por Género</h2>
            <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 2 }}>Top 8 en cada categoría</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="genre-grid">
            {GENRE_TOPS.map(g => (
              <GenreTopList key={g.title} items={g.items} title={g.title} accentColor={g.color} href={g.href} type={g.type} />
            ))}
          </div>
        </section>

        {/* Trending as carousel */}
        {trendingItems.length > 0 && (
          <section id="trending" style={{ marginLeft: 'calc(var(--page-pad) * -1)', marginRight: 'calc(var(--page-pad) * -1)' }}>
            <TmdbCarousel
              items={trendingItems}
              title="Tendencias esta semana"
              subtitle="Lo más visto en TMDB ahora mismo"
              type="movie"
              viewAllHref="/discover?sort=popularity.desc&type=movie"
            />
          </section>
        )}

      </div>

      <style>{`
        .top-row { transition: background .2s var(--ease-out); }
        .top-row:hover { background: var(--surface2) !important; border-radius: var(--radius); }
        .pill-link:hover { background: rgba(139,92,246,0.2) !important; border-color: rgba(139,92,246,0.4) !important; color: var(--text) !important; }
        @media (max-width: 768px) {
          .top-main-grid { grid-template-columns: 1fr !important; }
          .genre-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .genre-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
