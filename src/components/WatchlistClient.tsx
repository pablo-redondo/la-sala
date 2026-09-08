'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getWatchlist, removeFromWatchlist } from '@/lib/watchlist'
import { getTmdbWatchlist, removeFromTmdbWatchlist } from '@/lib/tmdb-watchlist'
import { getPosterUrl } from '@/services/tmdb'
import type { TmdbWatchlistItem } from '@/lib/tmdb-watchlist'
import type { OmdbDetail } from '@/types/omdb'

function TmdbWatchlistCard({ item, onRemove }: { item: TmdbWatchlistItem; onRemove: () => void }) {
  const poster = getPosterUrl(item.posterPath, 'w342')
  return (
    <div className="wl-card" style={{ position: 'relative' }}
      onMouseEnter={e => { const btn = e.currentTarget.querySelector<HTMLButtonElement>('[data-remove]'); if (btn) btn.style.opacity = '1' }}
      onMouseLeave={e => { const btn = e.currentTarget.querySelector<HTMLButtonElement>('[data-remove]'); if (btn) btn.style.opacity = '0' }}
    >
      <Link href={`/tmdb/${item.type}/${item.tmdbId}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="wl-card-img" style={{ position: 'relative', aspectRatio: '2/3', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface2)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', transition: 'transform .35s var(--ease-out), box-shadow .35s var(--ease-out)' }}>
          {poster
            ? <Image src={poster} alt={item.title} fill sizes="(max-width: 640px) 45vw, 200px" style={{ objectFit: 'cover' }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">{item.type === 'tv' ? <><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></> : <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>}</svg></div>
          }
          {item.rating && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(8,7,13,0.85)', color: 'var(--gold)', fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 999, border: '1px solid rgba(251,191,36,0.3)' }}>
              ★ {item.rating.toFixed(1)}
            </div>
          )}
          <div style={{ position: 'absolute', top: 8, left: 8, background: item.type === 'tv' ? 'rgba(34,211,238,0.9)' : 'rgba(244,114,182,0.9)', color: '#0a0812', fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6 }}>
            {item.type === 'tv' ? 'SERIE' : 'PEL.'}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.year}</p>
        </div>
      </Link>
      <button data-remove onClick={onRemove} style={{
        position: 'absolute', top: 8, left: 8,
        background: 'rgba(239,68,68,0.9)', color: '#fff', fontSize: 11, fontWeight: 700,
        padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
        opacity: 0, transition: 'opacity .2s',
      }}>✕ Quitar</button>
    </div>
  )
}

function OmdbWatchlistCard({ item, onRemove }: { item: OmdbDetail; onRemove: () => void }) {
  const poster = item.Poster && item.Poster !== 'N/A' ? item.Poster : null
  return (
    <div className="wl-card" style={{ position: 'relative' }}
      onMouseEnter={e => { const btn = e.currentTarget.querySelector<HTMLButtonElement>('[data-remove]'); if (btn) btn.style.opacity = '1' }}
      onMouseLeave={e => { const btn = e.currentTarget.querySelector<HTMLButtonElement>('[data-remove]'); if (btn) btn.style.opacity = '0' }}
    >
      <Link href={`/${item.Type === 'series' ? 'tv' : 'movie'}/${item.imdbID}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="wl-card-img" style={{ position: 'relative', aspectRatio: '2/3', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface2)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', transition: 'transform .35s var(--ease-out), box-shadow .35s var(--ease-out)' }}>
          {poster
            ? <Image src={poster} alt={item.Title} fill sizes="(max-width: 640px) 45vw, 200px" style={{ objectFit: 'cover' }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg></div>
          }
          {item.imdbRating && item.imdbRating !== 'N/A' && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(8,7,13,0.85)', color: 'var(--gold)', fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 999, border: '1px solid rgba(251,191,36,0.3)' }}>
              ★ {item.imdbRating}
            </div>
          )}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.Title}</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{item.Year}</p>
        </div>
      </Link>
      <button data-remove onClick={onRemove} style={{
        position: 'absolute', top: 8, left: 8,
        background: 'rgba(239,68,68,0.9)', color: '#fff', fontSize: 11, fontWeight: 700,
        padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
        opacity: 0, transition: 'opacity .2s',
      }}>✕ Quitar</button>
    </div>
  )
}

export default function WatchlistClient() {
  const [tmdbList, setTmdbList] = useState<TmdbWatchlistItem[]>([])
  const [omdbList, setOmdbList] = useState<OmdbDetail[]>([])

  useEffect(() => {
    setTmdbList(getTmdbWatchlist())
    setOmdbList(getWatchlist())
  }, [])

  const total = tmdbList.length + omdbList.length

  if (total === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 64, paddingBottom: 64, gap: 14 }}>
        <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-soft)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: 'var(--text)' }}>Tu lista está vacía</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', maxWidth: 280 }}>
          Añade películas y series desde su página de detalle
        </p>
      </div>
    )
  }

  return (
    <div>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--violet)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gradient)' }} />
        {total} {total === 1 ? 'título guardado' : 'títulos guardados'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 20 }}>
        {tmdbList.map(item => (
          <TmdbWatchlistCard key={`tmdb-${item.type}-${item.tmdbId}`} item={item} onRemove={() => {
            removeFromTmdbWatchlist(item.tmdbId, item.type)
            setTmdbList(prev => prev.filter(i => !(i.tmdbId === item.tmdbId && i.type === item.type)))
          }} />
        ))}
        {omdbList.map(item => (
          <OmdbWatchlistCard key={`omdb-${item.imdbID}`} item={item} onRemove={() => {
            removeFromWatchlist(item.imdbID)
            setOmdbList(prev => prev.filter(i => i.imdbID !== item.imdbID))
          }} />
        ))}
      </div>

      <style>{`
        .wl-card:hover .wl-card-img { transform: translateY(-4px); box-shadow: 0 16px 36px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.25); }
      `}</style>
    </div>
  )
}
