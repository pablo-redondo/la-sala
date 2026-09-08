'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { TmdbMovieResult } from '@/services/tmdb'
import { getPosterUrl } from '@/lib/tmdb'
import Reveal from './Reveal'

type Props = {
  items: TmdbMovieResult[]
  title: string
  subtitle?: string
  type: 'movie' | 'tv'
  viewAllHref?: string
}

function TmdbCard({ item, type }: { item: TmdbMovieResult; type: 'movie' | 'tv' }) {
  const poster = getPosterUrl(item.poster_path, 'w342')
  const title = item.title ?? item.name ?? ''
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4)
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null
  const href = `/tmdb/${type === 'tv' ? 'tv' : 'movie'}/${item.id}`

  return (
    <Link href={href} style={{ display: 'block', textDecoration: 'none', position: 'relative' }} className="tmdb-card">
      <div style={{
        position: 'relative',
        aspectRatio: '2/3',
        width: '100%',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'var(--surface2)',
      }} className="tmdb-card-img">
        {poster ? (
          <Image src={poster} alt={title} fill sizes="(max-width: 768px) 40vw, 180px"
            style={{ objectFit: 'cover', transition: 'transform .5s var(--ease-out)' }} className="tmdb-poster" />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
              {type === 'tv'
                ? <><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></>
                : <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>}
            </svg>
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 45%)', opacity: 0, transition: 'opacity .3s' }} className="tmdb-overlay" />

        {/* Rating badge */}
        {rating && (
          <div style={{
            position: 'absolute', top: 7, right: 7,
            display: 'flex', alignItems: 'center', gap: 3,
            background: 'rgba(8,7,13,0.85)',
            color: 'var(--gold)', fontSize: 10, fontWeight: 800,
            padding: '3px 7px', borderRadius: 999,
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(251,191,36,0.25)',
          }}>★ {rating}</div>
        )}

        {/* Type pill */}
        <div style={{
          position: 'absolute', top: 7, left: 7,
          background: type === 'tv' ? 'rgba(34,211,238,0.9)' : 'rgba(244,114,182,0.9)',
          color: '#0a0812', fontSize: 8, fontWeight: 800,
          padding: '2px 6px', borderRadius: 4,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          backdropFilter: 'blur(6px)',
        }}>{type === 'tv' ? 'SERIE' : 'PEL.'}</div>

        {/* Play glyph on hover */}
        <div className="tmdb-play" style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transform: 'scale(0.7)', transition: 'opacity .25s var(--ease-out), transform .25s var(--ease-out)',
        }}>
          <span style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px -4px rgba(139,92,246,0.7)',
          }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="#0a0812"><path d="M3 2l7 4-7 4V2z"/></svg>
          </span>
        </div>
      </div>

      <div style={{ marginTop: 9, padding: '0 1px' }}>
        <p style={{
          fontSize: 12.5, fontWeight: 600,
          color: 'var(--text)',
          transition: 'color .15s',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          lineHeight: 1.3,
        }} className="tmdb-title">{title}</p>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontWeight: 400 }}>{year}</p>
      </div>

      <style>{`
        .tmdb-card:hover .tmdb-poster { transform: scale(1.08); }
        .tmdb-card:hover .tmdb-overlay { opacity: 1; }
        .tmdb-card:hover .tmdb-play { opacity: 1; transform: scale(1); }
        .tmdb-card:hover .tmdb-title { color: var(--violet); }
        .tmdb-card-img {
          box-shadow: 0 2px 12px rgba(0,0,0,0.5);
          transition: box-shadow .35s var(--ease-out), transform .35s var(--ease-out);
        }
        .tmdb-card:hover .tmdb-card-img {
          transform: translateY(-6px);
          box-shadow: 0 20px 44px -8px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.3), 0 0 32px -6px rgba(139,92,246,0.4);
        }
      `}</style>
    </Link>
  )
}

export default function TmdbCarousel({ items, title, subtitle, type, viewAllHref }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [items])

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 560 : -560, behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <Reveal>
      <section>
        {/* Header row */}
        <div className="page-offset" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
            <div style={{ minWidth: 0 }}>
              {subtitle && (
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: 'var(--violet)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gradient)' }} />
                  {subtitle}
                </p>
              )}
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(19px, 2vw, 25px)',
                fontWeight: 700,
                color: 'var(--text)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
              }}>{title}</h2>
            </div>

            <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center', paddingBottom: 2 }}>
              {viewAllHref && (
                <Link href={viewAllHref} className="view-all-link" style={{ fontSize: 11, color: 'var(--muted2)', textDecoration: 'none', fontWeight: 600, marginRight: 8, whiteSpace: 'nowrap', transition: 'color .15s' }}>
                  Ver todo →
                </Link>
              )}
              {(['←', '→'] as const).map((arrow, i) => {
                const active = i === 0 ? canLeft : canRight
                return (
                  <button key={arrow} onClick={() => scroll(i === 0 ? 'left' : 'right')} disabled={!active} className="carousel-arrow"
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: '1px solid var(--border)',
                      background: active ? 'var(--surface2)' : 'transparent',
                      color: active ? 'var(--muted2)' : 'rgba(255,255,255,0.1)',
                      fontSize: 12, cursor: active ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .2s var(--ease-out)',
                    }}>{arrow}</button>
                )
              })}
            </div>
          </div>
          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)' }} />
        </div>

        {/* Scroll row */}
        <div ref={scrollRef} className="scrollbar-hide" style={{ overflowX: 'auto' }}>
          <div className="page-offset-l" style={{
            display: 'flex', gap: 12,
            paddingRight: 'var(--page-pad)',
            paddingBottom: 4,
            width: 'max-content',
          }}>
            {items.map(item => (
              <div key={item.id} style={{ flexShrink: 0, width: 'clamp(120px, 9.5vw, 155px)' }}>
                <TmdbCard item={item} type={type} />
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .view-all-link:hover { color: var(--violet) !important; }
          .carousel-arrow:not(:disabled):hover { border-color: var(--violet) !important; color: var(--text) !important; transform: scale(1.08); }
        `}</style>
      </section>
    </Reveal>
  )
}
