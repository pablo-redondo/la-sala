import WatchlistClient from '@/components/WatchlistClient'

export default function WatchlistPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      <div style={{ position: 'relative', borderBottom: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40%', left: '-6%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.28), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div className="page-inner" style={{ position: 'relative', paddingTop: 32, paddingBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3.4vw, 40px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Mi <span className="text-gradient">Lista</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 8 }}>
            Películas y series guardadas
          </p>
        </div>
      </div>

      <div className="page-inner" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <WatchlistClient />
      </div>

    </div>
  )
}
