export const revalidate = 3600

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCollection, getBackdropUrl, getPosterUrl } from '@/services/tmdb'
import { isTmdbId } from '@/lib/ids'

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!isTmdbId(id)) notFound()

  const collection = await getCollection(id)
  if (!collection) notFound()

  const backdrop = getBackdropUrl(collection.backdrop_path, 'w1280')
  const parts = (collection.parts ?? []).filter(p => p.poster_path).sort((a, b) => {
    const da = a.release_date ?? ''
    const db = b.release_date ?? ''
    return da.localeCompare(db)
  })

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
        {backdrop && (
          <Image src={backdrop} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover', filter: 'brightness(0.35) saturate(1.1)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,7,13,0.1) 0%, rgba(8,7,13,0.5) 60%, var(--bg) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--bg) 0%, rgba(8,7,13,0.2) 50%, transparent 100%)' }} />
        <div className="page-inner" style={{ position: 'absolute', bottom: 36, left: 0, right: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--violet)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, opacity: 0.9 }}>Saga · {parts.length} películas</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 60px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 0.98 }}>
            {collection.name}
          </h1>
        </div>
      </div>

      <div className="page-inner" style={{ paddingTop: 32, paddingBottom: 80 }}>
        {collection.overview && (
          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7, maxWidth: '70ch', marginBottom: 36 }}>
            {collection.overview}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
          {parts.map((movie, i) => {
            const poster = getPosterUrl(movie.poster_path, 'w342')
            const title = movie.title ?? movie.name ?? ''
            const year = (movie.release_date ?? '').slice(0, 4)
            const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null

            return (
              <Link key={movie.id} href={`/tmdb/movie/${movie.id}`} className="collection-card" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="collection-card-img" style={{ position: 'relative', aspectRatio: '2/3', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--surface2)', transition: 'transform .3s var(--ease-out), box-shadow .3s var(--ease-out)' }}>
                  {poster && <Image src={poster} alt={title} fill sizes="200px" style={{ objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.8)', color: 'var(--muted)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                    #{i + 1}
                  </div>
                  {rating && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.85)', color: 'var(--gold)', fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 999, border: '1px solid rgba(251,191,36,0.3)' }}>
                      ★ {rating}
                    </div>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{year}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <style>{`
        .collection-card:hover .collection-card-img { transform: translateY(-4px); box-shadow: 0 16px 36px -8px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.3); }
      `}</style>
    </div>
  )
}
