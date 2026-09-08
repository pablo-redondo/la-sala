'use client'

import { useState, useEffect } from 'react'
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist'
import type { OmdbDetail } from '@/types/omdb'

export default function WatchlistButton({ movie }: { movie: OmdbDetail }) {
  const [inList, setInList] = useState(false)

  useEffect(() => {
    setInList(isInWatchlist(movie.imdbID))
  }, [movie.imdbID])

  function toggle() {
    if (inList) {
      removeFromWatchlist(movie.imdbID)
      setInList(false)
    } else {
      addToWatchlist(movie)
      setInList(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className={inList ? 'btn-gradient' : 'btn-ghost'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: inList ? undefined : 'rgba(139,92,246,0.1)',
        color: inList ? undefined : 'var(--text)',
        border: inList ? 'none' : '1px solid rgba(139,92,246,0.3)',
        fontWeight: 700, fontSize: 13,
        padding: '11px 22px', borderRadius: 'var(--radius)',
        cursor: 'pointer',
      }}
    >
      {inList ? '✓ En mi lista' : '+ Mi lista'}
    </button>
  )
}
