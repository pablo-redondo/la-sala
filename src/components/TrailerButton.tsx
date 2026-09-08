'use client'

import { useState, useEffect } from 'react'

export default function TrailerButton({ videoKey }: { videoKey: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
          color: 'var(--text)', fontWeight: 700, fontSize: 13,
          padding: '10px 20px', borderRadius: 'var(--radius)', cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          transition: 'background .2s var(--ease-out), border-color .2s var(--ease-out), transform .15s var(--ease-out)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        Ver tráiler
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
          />

          {/* Modal */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 960, zIndex: 1 }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute', top: -44, right: 0,
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
                color: 'var(--text)', fontSize: 14, fontWeight: 700,
                padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              ✕ Cerrar
            </button>
            <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000', borderRadius: 14, overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
                allow="autoplay; encrypted-media; fullscreen"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                title="Tráiler"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
