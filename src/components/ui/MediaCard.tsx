'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { MediaItem } from '@/types/omdb'

export default function MediaCard({ item }: { item: MediaItem }) {
  const [hovered, setHovered] = useState(false)
  const routeType = item.type === 'movie' ? 'movie' : 'tv'
  const href = `/${routeType}/${item.imdbID}`

  return (
    <Link
      href={href}
      style={{ display: 'block', textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Poster container */}
      <div style={{
        position: 'relative',
        aspectRatio: '2/3',
        width: '100%',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        background: 'var(--surface2)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform .35s var(--ease-out), box-shadow .35s var(--ease-out)',
        boxShadow: hovered
          ? '0 20px 44px -8px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.3), 0 0 32px -6px rgba(139,92,246,0.4)'
          : '0 4px 16px rgba(0,0,0,0.4)',
      }}>

        {item.poster ? (
          <Image
            src={item.poster}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 40vw, 200px"
            style={{ objectFit: 'cover', transition: 'transform .5s var(--ease-out)', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          </div>
        )}

        {/* Rating badge */}
        {item.rating && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            display: 'flex', alignItems: 'center', gap: 3,
            background: 'rgba(8,7,13,0.85)', backdropFilter: 'blur(8px)',
            color: 'var(--gold)', fontSize: 11, fontWeight: 800,
            padding: '4px 8px', borderRadius: 999,
            border: '1px solid rgba(251,191,36,0.3)',
          }}>
            ★ {item.rating}
          </div>
        )}

        {/* Type badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: item.type === 'series' ? 'rgba(34,211,238,0.9)' : 'rgba(244,114,182,0.9)',
          color: '#0a0812', fontSize: 9, fontWeight: 800,
          padding: '3px 7px', borderRadius: 6,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          backdropFilter: 'blur(8px)',
        }}>
          {item.type === 'series' ? 'SERIE' : 'PELÍCULA'}
        </div>

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
        }} />

        {/* Play glyph on hover */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1)' : 'scale(0.7)',
          transition: 'opacity .25s var(--ease-out), transform .25s var(--ease-out)',
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

      {/* Info below */}
      <div style={{ marginTop: 10, padding: '0 2px' }}>
        <p style={{
          fontSize: 13, fontWeight: 700,
          color: hovered ? 'var(--violet)' : 'var(--text)',
          transition: 'color .2s',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          lineHeight: 1.3,
        }}>
          {item.title}
        </p>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, fontWeight: 500 }}>
          {item.year}
        </p>
      </div>
    </Link>
  )
}
