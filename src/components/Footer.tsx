import Link from 'next/link'

const LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Películas', href: '/movies' },
  { label: 'Series', href: '/tv' },
  { label: 'Estrenos', href: '/estrenos' },
  { label: 'Streaming', href: '/streaming' },
  { label: 'Descubrir', href: '/discover' },
  { label: 'Top', href: '/top' },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'var(--gradient)', opacity: 0.5 }} />
      <div className="page-inner" style={{ paddingTop: 28, paddingBottom: 28 }}>

        {/* Single row: logo + nav links + data attribution */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              width: 18, height: 18, borderRadius: 6,
              background: 'var(--gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="#0a0812"><path d="M3 2l7 4-7 4V2z"/></svg>
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              lineHeight: 1,
            }}>La Sala</span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', flex: 1 }}>
            {LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="footer-nav-link" style={{
                fontSize: 12, color: 'var(--muted2)', textDecoration: 'none',
                padding: '4px 12px',
                transition: 'color .15s',
              }}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Data attribution */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: 'var(--muted)', opacity: 0.7 }}>Datos:</span>
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, color: 'var(--muted)', opacity: 0.7, textDecoration: 'none' }}>TMDB</a>
            <span style={{ fontSize: 10, color: 'var(--muted)', opacity: 0.4 }}>·</span>
            <a href="https://www.omdbapi.com" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 10, color: 'var(--muted)', opacity: 0.7, textDecoration: 'none' }}>OMDb</a>
          </div>
        </div>

        {/* Divider + copyright */}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>
            © {new Date().getFullYear()} La Sala — Proyecto personal, no afiliado a TMDB ni OMDb.
          </p>
        </div>
      </div>

      <style>{`
        .footer-nav-link:hover { color: var(--text) !important; }
      `}</style>
    </footer>
  )
}
