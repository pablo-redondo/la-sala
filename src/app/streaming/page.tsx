export const revalidate = 3600

import { discoverMovies, discoverTV, getPosterUrl } from '@/services/tmdb'
import Image from 'next/image'
import Link from 'next/link'
import type { TmdbMovieResult } from '@/services/tmdb'

const PROVIDERS = [
  { id: '8',   name: 'Netflix',       color: '#e50914', gradient: 'linear-gradient(135deg,#e50914,#b20710)', logoText: 'N' },
  { id: '384', name: 'Max',           color: '#002be7', gradient: 'linear-gradient(135deg,#002be7,#0041ff)', logoText: 'M' },
  { id: '337', name: 'Disney+',       color: '#0063e5', gradient: 'linear-gradient(135deg,#0063e5,#113ccf)', logoText: 'D+' },
  { id: '119', name: 'Prime Video',   color: '#00a8e0', gradient: 'linear-gradient(135deg,#00a8e0,#007faa)', logoText: 'P' },
  { id: '350', name: 'Apple TV+',     color: '#555', gradient: 'linear-gradient(135deg,#555,#222)', logoText: '▶' },
  { id: '149', name: 'Movistar+',     color: '#009bde', gradient: 'linear-gradient(135deg,#009bde,#0076a3)', logoText: 'M+' },
]

type TaggedItem = TmdbMovieResult & { _type: 'movie' | 'tv' }

function StreamingCard({ item }: { item: TaggedItem }) {
  const poster = getPosterUrl(item.poster_path, 'w342')
  const title = item.title ?? item.name ?? ''
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)
  const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null

  return (
    <Link href={`/tmdb/${item._type}/${item.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, width: 'clamp(120px, 9.5vw, 155px)' }} className="streaming-card">
      <div style={{ position: 'relative', aspectRatio: '2/3', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface2)' }}>
        {poster
          ? <Image src={poster} alt={title} fill sizes="155px" style={{ objectFit: 'cover', transition: 'transform .3s ease' }} className="streaming-img" />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">{item._type === 'tv' ? <><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></> : <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>}</svg></div>
        }
        {rating && (
          <div style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,0.88)', color: 'var(--gold)', fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 999 }}>★ {rating}</div>
        )}
        <div style={{ position: 'absolute', top: 7, left: 7, background: item._type === 'tv' ? 'rgba(34,211,238,0.9)' : 'rgba(244,114,182,0.9)', color: '#0a0812', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 5 }}>
          {item._type === 'tv' ? 'SERIE' : 'PEL.'}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
      {year && <p style={{ fontSize: 11, color: 'var(--muted)' }}>{year}</p>}
    </Link>
  )
}

type PlatformData = {
  provider: typeof PROVIDERS[number]
  items: TaggedItem[]
  movieCount: number
  tvCount: number
}

async function fetchPlatform(provider: typeof PROVIDERS[number]): Promise<PlatformData> {
  const opts = { with_watch_providers: provider.id, watch_region: 'ES', sort_by: 'popularity.desc', 'vote_count.gte': '10' }
  const [moviesRes, tvRes] = await Promise.all([
    discoverMovies(opts),
    discoverTV(opts),
  ])
  const movies: TaggedItem[] = moviesRes.results.filter(m => m.poster_path).slice(0, 10).map(m => ({ ...m, _type: 'movie' as const }))
  const tv: TaggedItem[] = tvRes.results.filter(s => s.poster_path).slice(0, 10).map(s => ({ ...s, _type: 'tv' as const }))

  // Interleave movies and TV so the row shows variety
  const interleaved: TaggedItem[] = []
  const maxLen = Math.max(movies.length, tv.length)
  for (let i = 0; i < maxLen; i++) {
    if (movies[i]) interleaved.push(movies[i])
    if (tv[i]) interleaved.push(tv[i])
  }

  return { provider, items: interleaved, movieCount: movies.length, tvCount: tv.length }
}

export default async function StreamingPage() {
  const platforms = await Promise.all(PROVIDERS.map(fetchPlatform))

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="page-inner" style={{ paddingTop: 28, paddingBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.4vw, 36px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>Streaming</h1>
              <p style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 6 }}>Lo más popular en cada plataforma en España</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PROVIDERS.map(p => (
                <Link key={p.id} href={`#${p.id}`} className="pill-link" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid var(--border)', color: 'var(--muted2)', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: 3, background: p.gradient, color: '#fff', fontSize: 7, fontWeight: 900, letterSpacing: '-0.3px', flexShrink: 0 }}>{p.logoText}</span>
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Platform sections */}
      <div style={{ paddingBottom: 48 }}>
        {platforms.map(({ provider, items, movieCount, tvCount }) => {
          if (items.length === 0) return null
          return (
            <div key={provider.id} id={provider.id} style={{ paddingTop: 24 }}>
              {/* Section header */}
              <div className="page-inner" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: provider.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: '-0.4px', flexShrink: 0, boxShadow: `0 4px 14px ${provider.color}40` }}>
                    {provider.logoText}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px' }}>{provider.name}</h2>
                    <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                      {movieCount} películas · {tvCount} series
                    </p>
                  </div>
                  <Link href={`/discover?sort=popularity.desc&type=movie&provider=${provider.id}`} className="view-more-link" style={{ fontSize: 11, color: 'var(--muted2)', textDecoration: 'none', fontWeight: 600, flexShrink: 0, transition: 'color .2s' }}>Ver más →</Link>
                </div>
              </div>

              {/* Horizontal scroll row */}
              <div className="page-offset" style={{ overflowX: 'auto', paddingBottom: 10 }} data-platform-scroll>
                <div style={{ display: 'flex', gap: 12, paddingRight: 'var(--page-pad)', width: 'max-content' }} className="streaming-row">
                  {items.map(item => (
                    <StreamingCard key={`${item._type}-${item.id}`} item={item} />
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border)', marginTop: 16, marginLeft: 'var(--page-pad)', marginRight: 'var(--page-pad)' }} />
            </div>
          )
        })}
      </div>

      <style>{`
        .streaming-card:hover .streaming-img { transform: scale(1.08); }
        .streaming-row .streaming-card { transition: transform .35s var(--ease-out), filter .35s var(--ease-out); }
        .streaming-row .streaming-card:hover { transform: translateY(-4px); filter: drop-shadow(0 12px 24px rgba(0,0,0,0.5)); }
        .pill-link:hover { background: rgba(139,92,246,0.2) !important; border-color: rgba(139,92,246,0.4) !important; color: var(--text) !important; }
        .view-more-link:hover { color: var(--violet) !important; }
        [data-platform-scroll] { scrollbar-width: none; -ms-overflow-style: none; }
        [data-platform-scroll]::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
