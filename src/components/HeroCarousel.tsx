'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { normalizePoster } from '@/lib/omdb'
import type { OmdbDetail } from '@/types/omdb'

const INTERVAL_MS = 7000

export default function HeroCarousel({ movies }: { movies: OmdbDetail[] }) {
  if (!movies.length) return null
  return <HeroCarouselInner movies={movies} />
}

function HeroCarouselInner({ movies }: { movies: OmdbDetail[] }) {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  const goTo = useCallback((idx: number) => {
    if (idx === current) return
    setFading(true)
    setTimeout(() => { setCurrent(idx); setFading(false) }, 280)
  }, [current])

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % movies.length), INTERVAL_MS)
    return () => clearInterval(t)
  }, [current, movies.length, goTo])

  const movie = movies[current]
  const poster = normalizePoster(movie.Poster)
  const genres = movie.Genre !== 'N/A' ? movie.Genre.split(', ').slice(0, 3) : []
  const director = movie.Director !== 'N/A' ? movie.Director.split(', ').slice(0, 2).join(', ') : null
  const cast = movie.Actors !== 'N/A' ? movie.Actors.split(', ').slice(0, 3).join(', ') : null

  return (
    <section style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* ── Fondo desenfocado (absolute) ── */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: fading ? 0 : 1, transition: 'opacity .28s',
        zIndex: 0,
      }}>
        {poster && (
          <Image src={poster} alt="" fill priority sizes="100vw"
            style={{ objectFit: 'cover', transform: 'scale(1.1)', filter: 'blur(72px)', opacity: 0.3 }}
          />
        )}
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, #0d0b08 20%, rgba(13,11,8,0.82) 52%, rgba(13,11,8,0.25) 78%, transparent)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, #0d0b08 0%, transparent 40%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, #0d0b08 0%, transparent 12%)' }} />

      {/* ── Contenido principal (flujo normal) ── */}
      <div className="page-inner" style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center',
        gap: 'clamp(20px, 3vw, 48px)',
        paddingTop: 'clamp(32px, 4vh, 56px)',
        paddingBottom: 'clamp(20px, 2.5vh, 36px)',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(6px)' : 'translateY(0)',
        transition: 'opacity .28s, transform .28s',
      }}>

        {/* — Info izquierda — */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'rgba(212,152,42,0.1)', border: '1px solid rgba(212,152,42,0.3)',
              color: '#d4982a', fontSize: 10, fontWeight: 800,
              padding: '3px 10px', borderRadius: 999, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 5, height: 5, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              Destacado
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{movie.Year}</span>
            {movie.Runtime !== 'N/A' && <span style={{ color: 'var(--muted)', fontSize: 12 }}>{movie.Runtime}</span>}
            {movie.Rated !== 'N/A' && (
              <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
                {movie.Rated}
              </span>
            )}
          </div>

          {/* Título */}
          <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 'clamp(48px, 6vw, 88px)', fontWeight: 400, lineHeight: 0.9, letterSpacing: '2px', color: '#fff', margin: 0 }}>
            {movie.Title}
          </h1>

          {/* Rating */}
          {movie.imdbRating !== 'N/A' && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ color: 'var(--accent)', fontSize: 17 }}>★</span>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 19 }}>{movie.imdbRating}</span>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>/10 · IMDb</span>
              {movie.imdbVotes && <span style={{ color: 'var(--muted)', fontSize: 11 }}>· {movie.imdbVotes} votos</span>}
            </div>
          )}

          {/* Géneros */}
          {genres.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {genres.map(g => (
                <span key={g} style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--muted)', fontSize: 11, padding: '3px 11px', borderRadius: 999,
                }}>{g}</span>
              ))}
            </div>
          )}

          {/* Sinopsis */}
          <p style={{
            color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            maxWidth: '52ch',
          }}>
            {movie.Plot}
          </p>

          {/* Director + Reparto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {director && (
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                <span style={{ color: 'rgba(255,255,255,0.62)', fontWeight: 700, marginRight: 6 }}>Dirección</span>
                {director}
              </p>
            )}
            {cast && (
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                <span style={{ color: 'rgba(255,255,255,0.62)', fontWeight: 700, marginRight: 6 }}>Reparto</span>
                {cast}
              </p>
            )}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <Link href={`/movie/${movie.imdbID}`} style={{
              background: '#d4982a', color: '#0d0b08', fontWeight: 800, fontSize: 13,
              padding: '11px 26px', borderRadius: 10, textDecoration: 'none',
            }}>
              ▶ Ver detalles
            </Link>
            <Link href={`/movie/${movie.imdbID}`} style={{
              background: 'rgba(212,152,42,0.08)', border: '1px solid rgba(212,152,42,0.2)',
              color: '#f0ece3', fontWeight: 600, fontSize: 13,
              padding: '11px 22px', borderRadius: 10, textDecoration: 'none',
              backdropFilter: 'blur(12px)',
            }}>
              + Mi lista
            </Link>
          </div>
        </div>

        {/* — Poster derecha — */}
        {poster && (
          <div style={{ flexShrink: 0, display: 'none' }} className="hero-poster">
            <div style={{ position: 'relative', width: 'clamp(160px, 14vw, 230px)' }}>
              <div style={{ position: 'absolute', inset: '15%', background: 'rgba(255,255,255,0.06)', filter: 'blur(32px)', borderRadius: 20 }} />
              <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', boxShadow: '0 28px 64px -8px rgba(0,0,0,0.9)', outline: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(1.5deg)' }}>
                <Image src={poster} alt={movie.Title} width={230} height={345} style={{ width: '100%', display: 'block' }} priority />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Tira de miniaturas (flujo normal, dentro del section) ── */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="page-inner" style={{
          paddingTop: 12, paddingBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {movies.map((m, i) => {
            const p = normalizePoster(m.Poster)
            const active = i === current
            return (
              <button key={m.imdbID} onClick={() => goTo(i)} title={m.Title}
                style={{
                  position: 'relative', flexShrink: 0,
                  width: active ? 'clamp(60px, 5.5vw, 82px)' : 'clamp(46px, 4.2vw, 62px)',
                  aspectRatio: '2/3', borderRadius: 7, overflow: 'hidden',
                  border: active ? '2px solid var(--accent)' : '2px solid rgba(255,255,255,0.08)',
                  background: 'var(--surface2)', cursor: 'pointer', padding: 0,
                  opacity: active ? 1 : 0.45,
                  boxShadow: active ? '0 0 12px rgba(255,255,255,0.12)' : 'none',
                  transition: 'width .3s, opacity .2s, border-color .2s',
                }}
              >
                {p ? <Image src={p} alt={m.Title} fill sizes="82px" style={{ objectFit: 'cover' }} /> : null}
                {active && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.5)' }}>
                    <div key={`p-${current}`} style={{ height: '100%', background: 'var(--accent)', animation: `heroProgress ${INTERVAL_MS}ms linear forwards` }} />
                  </div>
                )}
              </button>
            )
          })}

          {/* Flechas alineadas a la derecha */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {(['←', '→'] as const).map((arrow, i) => (
              <button key={arrow}
                onClick={() => goTo(i === 0 ? (current - 1 + movies.length) % movies.length : (current + 1) % movies.length)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: '1px solid var(--border)', background: 'var(--surface2)',
                  color: 'var(--text)', fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{arrow}</button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) { .hero-poster { display: block !important; } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes heroProgress { from{width:0%} to{width:100%} }
      `}</style>
    </section>
  )
}
