'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/movies', label: 'Películas' },
  { href: '/tv', label: 'Series' },
  { href: '/estrenos', label: 'Estrenos' },
  { href: '/discover', label: 'Descubrir' },
  { href: '/top', label: 'Top' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
    setQ('')
    inputRef.current?.blur()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: 62,
      display: 'flex', alignItems: 'center',
      background: scrolled ? 'rgba(8,7,13,0.85)' : 'rgba(8,7,13,0.55)',
      backdropFilter: 'blur(20px) saturate(160%)',
      borderBottom: `1px solid ${scrolled ? 'var(--border2)' : 'transparent'}`,
      transition: 'background .3s var(--ease-out), border-color .3s var(--ease-out)',
    }}>
      <div className="page-inner" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>

        {/* Logo — flex:1 left */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Link href="/" className="logo-mark" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{
              position: 'relative', width: 26, height: 26, borderRadius: 8,
              background: 'var(--gradient)', backgroundSize: '200% 200%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 18px -3px rgba(139,92,246,0.7)',
              flexShrink: 0,
            }} className="logo-glyph">
              <svg width="13" height="13" viewBox="0 0 12 12" fill="#0a0812"><path d="M3 2l7 4-7 4V2z"/></svg>
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              lineHeight: 1,
            }}>
              La Sala
            </span>
          </Link>
        </div>

        {/* Nav — centered */}
        <nav style={{ display: 'flex', alignItems: 'center' }}>
          {NAV.map(({ href, label }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} className={`nv${active ? ' nv-active' : ''}`}
                style={{
                  padding: '0 14px',
                  height: 62,
                  display: 'flex', alignItems: 'center',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  textDecoration: 'none',
                  color: active ? 'var(--text)' : 'var(--muted2)',
                  position: 'relative',
                  transition: 'color .2s',
                  whiteSpace: 'nowrap',
                }}>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right side — flex:1, justify-end */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          {/* Search box */}
          <form onSubmit={onSearch}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: focused ? 'var(--surface2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${focused ? 'var(--violet)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-full)',
              padding: '0 12px',
              height: 34,
              width: focused ? 220 : 140,
              transition: 'width .3s var(--ease-out), background .2s, border-color .2s, box-shadow .2s',
              boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.15)' : 'none',
            }}>
              <svg width="12" height="12" fill="none" stroke={focused ? 'var(--violet)' : 'var(--muted)'} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={focused ? 'Buscar películas, series...' : 'Buscar… /'}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text)', fontSize: 12, width: '100%',
                  fontFamily: 'inherit',
                }}
              />
              {q && (
                <button type="button" onClick={() => setQ('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 11, padding: 0, lineHeight: 1, flexShrink: 0 }}>
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Mi lista — gradient button */}
          <Link href="/watchlist" className="btn-gradient" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12,
            padding: '0 16px', height: 34, borderRadius: 'var(--radius-full)',
            textDecoration: 'none', whiteSpace: 'nowrap',
            letterSpacing: '0.01em',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Mi lista
          </Link>
        </div>
      </div>

      <style>{`
        .nv::after {
          content: '';
          position: absolute;
          bottom: 8px; left: 14px; right: 14px;
          height: 2px;
          border-radius: 2px;
          background: var(--gradient);
          transform: scaleX(0);
          transform-origin: left;
          opacity: 0;
          transition: transform .3s var(--ease-out), opacity .2s;
        }
        .nv-active::after { opacity: 1; transform: scaleX(1); }
        .nv:hover { color: var(--text) !important; }
        .nv:hover::after { opacity: .6; transform: scaleX(1); }
        .nv-active:hover::after { opacity: 1; }
        .logo-glyph { animation: gradientShift 6s ease infinite; transition: transform .3s var(--ease-out); }
        .logo-mark:hover .logo-glyph { transform: rotate(-8deg) scale(1.08); }
      `}</style>
    </header>
  )
}
