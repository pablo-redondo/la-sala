'use client'

import { useRef, useState, useEffect } from 'react'
import MediaCard from './MediaCard'
import Reveal from '../Reveal'
import type { MediaItem } from '@/types/omdb'

type Props = {
  items: MediaItem[]
  title: string
  subtitle?: string
}

export default function MediaCarousel({ items, title, subtitle }: Props) {
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
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 640 : -640, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <Reveal>
      <section>

        {/* Cabecera — usa page-offset para alinearse perfectamente con los cards */}
        <div className="page-offset" style={{
          marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3, height: 20, background: 'var(--gradient)', borderRadius: 2, flexShrink: 0 }} />
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0 }}>
                {title}
              </h2>
              {subtitle && (
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>
              )}
            </div>
          </div>

          {/* Flechas */}
          <div style={{ display: 'flex', gap: 6 }}>
            {(['←', '→'] as const).map((arrow, i) => {
              const active = i === 0 ? canLeft : canRight
              return (
                <button
                  key={arrow}
                  onClick={() => scroll(i === 0 ? 'left' : 'right')}
                  disabled={!active}
                  className="carousel-arrow"
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    border: '1px solid var(--border)',
                    background: active ? 'var(--surface2)' : 'transparent',
                    color: active ? 'var(--text)' : 'rgba(255,255,255,0.15)',
                    fontSize: 13, cursor: active ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .2s var(--ease-out)',
                  }}
                >
                  {arrow}
                </button>
              )
            })}
          </div>
        </div>

        {/* Fila scrollable — el paddingLeft de page-offset-l cuadra con la cabecera */}
        <div ref={scrollRef} className="scrollbar-hide" style={{ overflowX: 'auto' }}>
          <div className="page-offset-l" style={{
            display: 'flex',
            gap: 12,
            paddingRight: 'var(--page-pad)',
            paddingBottom: 10,
            width: 'max-content',
          }}>
            {items.map((item) => (
              <div key={item.imdbID} style={{ flexShrink: 0, width: 'clamp(130px, 10.5vw, 168px)' }}>
                <MediaCard item={item} />
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .carousel-arrow:not(:disabled):hover { border-color: var(--violet) !important; color: var(--text) !important; transform: scale(1.08); }
        `}</style>
      </section>
    </Reveal>
  )
}
