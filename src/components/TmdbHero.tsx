'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getBackdropUrl, getPosterUrl } from '@/services/tmdb'
import type { TmdbMovieResult } from '@/services/tmdb'

const GENRE_MAP: Record<number, string> = {
  28: 'Acción', 12: 'Aventura', 16: 'Animación', 35: 'Comedia', 80: 'Crimen',
  18: 'Drama', 14: 'Fantasía', 27: 'Terror', 9648: 'Misterio', 10749: 'Romance',
  878: 'Sci-Fi', 53: 'Thriller', 37: 'Western', 10751: 'Familiar',
  10759: 'Acción & Av.', 10765: 'Sci-Fi & Fantasy',
}

const INTERVAL_MS = 8000

type Props = { items: TmdbMovieResult[]; type: 'movie' | 'tv' }

export default function TmdbHero({ items, type }: Props) {
  if (!items.length) return null
  return <TmdbHeroInner items={items} type={type} />
}

function TmdbHeroInner({ items, type }: Props) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (idx === current) return
    setFading(true)
    setTimeout(() => { setCurrent(idx); setFading(false) }, 300)
  }, [current])

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % items.length), INTERVAL_MS)
    return () => clearInterval(t)
  }, [current, items.length, goTo])

  const item = items[current]
  const backdrop = getBackdropUrl(item.backdrop_path, 'w1280')
  const poster = getPosterUrl(item.poster_path, 'w342')
  const title = item.title ?? item.name ?? ''
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)
  const genres = (item.genre_ids ?? []).slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean)
  const href = `/tmdb/${type}/${item.id}`

  return (
    <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Aurora accent blobs */}
      <div className="aurora-bg">
        <div className="aurora-blob" style={{ width: 480, height: 480, top: '-15%', left: '5%', background: 'radial-gradient(circle, rgba(139,92,246,0.55), transparent 70%)' }} />
        <div className="aurora-blob" style={{ width: 420, height: 420, top: '10%', right: '10%', background: 'radial-gradient(circle, rgba(34,211,238,0.4), transparent 70%)', animationDelay: '-8s' }} />
      </div>

      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: fading ? 0 : 1, transition: 'opacity .3s',
        zIndex: 0,
      }}>
        {(backdrop || poster) && (
          <Image src={backdrop ?? poster!} alt="" fill priority sizes="100vw"
            style={{ objectFit: 'cover', filter: 'brightness(0.38) saturate(1.15)' }} />
        )}
      </div>

      {/* Gradients */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, rgba(8,7,13,0.97) 0%, rgba(8,7,13,0.82) 45%, rgba(8,7,13,0.3) 75%, transparent 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(8,7,13,1) 0%, transparent 35%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(8,7,13,0.5) 0%, transparent 15%)' }} />

      {/* Main content */}
      <div className="page-inner" style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center',
        gap: 'clamp(20px, 3vw, 48px)',
        paddingTop: 'clamp(44px, 6vh, 76px)',
        paddingBottom: 'clamp(28px, 3.5vh, 44px)',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(6px)' : 'translateY(0)',
        transition: 'opacity .3s, transform .3s',
      }}>

        {/* Left info */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--gradient-soft)', border: '1px solid rgba(139,92,246,0.35)',
              fontSize: 10, fontWeight: 800,
              padding: '4px 11px', borderRadius: 999, letterSpacing: '0.1em', textTransform: 'uppercase',
            }} className="text-gradient">
              <span style={{ width: 5, height: 5, background: 'var(--cyan)', borderRadius: '50%', animation: 'pulseDot 2s infinite' }} />
              Destacado
            </span>
            {year && <span style={{ color: 'var(--muted2)', fontSize: 12 }}>{year}</span>}
            {genres.map(g => (
              <span key={g} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--muted2)', fontSize: 11, padding: '2px 10px', borderRadius: 999,
              }}>{g}</span>
            ))}
          </div>

          {/* Title — Bricolage Grotesque */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 6vw, 80px)',
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: 0,
          }}>{title}</h1>

          {/* Rating */}
          {item.vote_average > 0 && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ color: 'var(--gold)', fontSize: 16 }}>★</span>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{item.vote_average.toFixed(1)}</span>
              <span style={{ color: 'var(--muted2)', fontSize: 12 }}>/10 · TMDB</span>
            </div>
          )}

          {/* Overview */}
          {item.overview && (
            <p style={{
              color: 'var(--muted2)', fontSize: 13, lineHeight: 1.65, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              maxWidth: '52ch',
            }}>{item.overview}</p>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
            <Link href={href} className="btn-gradient" style={{
              fontSize: 13,
              padding: '12px 26px', borderRadius: 'var(--radius)', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M3 2l7 4-7 4V2z"/></svg>
              Ver detalles
            </Link>
            <Link href={href} className="btn-ghost" style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border2)',
              color: '#f5f3fb', fontWeight: 600, fontSize: 13,
              padding: '12px 22px', borderRadius: 'var(--radius)', textDecoration: 'none',
              backdropFilter: 'blur(12px)',
            }}>
              + Mi lista
            </Link>
          </div>
        </div>

        {/* Right poster */}
        {poster && (
          <div style={{ flexShrink: 0, display: 'none' }} className="hero-poster">
            <div style={{ position: 'relative', width: 'clamp(160px, 14vw, 220px)', animation: 'floatSlow 6s ease-in-out infinite' }}>
              <div style={{ position: 'absolute', inset: '15%', background: 'var(--gradient)', opacity: 0.25, filter: 'blur(40px)', borderRadius: 20 }} />
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 28px 64px -8px rgba(0,0,0,0.9)', outline: '1px solid rgba(255,255,255,0.12)', transform: 'rotate(1deg)' }}>
                <Image src={poster} alt={title} width={220} height={330} style={{ width: '100%', display: 'block' }} priority />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="page-inner" style={{
          paddingTop: 12, paddingBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {items.map((m, i) => {
            const p = getPosterUrl(m.poster_path, 'w185')
            const active = i === current
            return (
              <button key={m.id} onClick={() => goTo(i)} title={m.title ?? m.name ?? ''}
                style={{
                  position: 'relative', flexShrink: 0,
                  width: active ? 'clamp(58px, 5.2vw, 78px)' : 'clamp(44px, 4vw, 60px)',
                  aspectRatio: '2/3', borderRadius: 8, overflow: 'hidden',
                  border: active ? '2px solid var(--violet)' : '2px solid rgba(255,255,255,0.08)',
                  background: 'var(--surface2)', cursor: 'pointer', padding: 0,
                  opacity: active ? 1 : 0.45,
                  boxShadow: active ? '0 0 16px rgba(139,92,246,0.4)' : 'none',
                  transition: 'width .3s var(--ease-out), opacity .2s, border-color .2s',
                }}>
                {p && <Image src={p} alt={m.title ?? m.name ?? ''} fill sizes="78px" style={{ objectFit: 'cover' }} />}
                {active && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.5)' }}>
                    <div key={`p-${current}`} style={{ height: '100%', background: 'var(--gradient)', animation: `heroProgress ${INTERVAL_MS}ms linear forwards` }} />
                  </div>
                )}
              </button>
            )
          })}

          {/* Arrows */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {(['←', '→'] as const).map((arrow, i) => (
              <button key={arrow}
                onClick={() => goTo(i === 0 ? (current - 1 + items.length) % items.length : (current + 1) % items.length)}
                className="btn-ghost"
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '1px solid var(--border)', background: 'var(--surface2)',
                  color: 'var(--text)', fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{arrow}</button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .hero-poster { display: block !important; } }
        @keyframes heroProgress { from{width:0%} to{width:100%} }
      `}</style>
    </section>
  )
}
