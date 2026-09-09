import Image from 'next/image'
import Link from 'next/link'
import type { TmdbCastMember } from '@/services/tmdb'
import { getPosterUrl } from '@/services/tmdb'

export default function CastSection({ cast }: { cast: TmdbCastMember[] }) {
  if (!cast.length) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Reparto principal
        </p>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{cast.length} actores</span>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }} className="scrollbar-hide">
        {cast.map(member => {
          const photo = getPosterUrl(member.profile_path, 'w185')
          return (
            <Link key={member.id} href={`/person/${member.id}`}
              style={{ textDecoration: 'none', flexShrink: 0, width: 96 }}
            >
              <div style={{
                borderRadius: 10, overflow: 'hidden',
                aspectRatio: '2/3', background: 'var(--surface2)',
                position: 'relative', marginBottom: 8,
              }} className="cast-photo">
                {photo ? (
                  <Image src={photo} alt={member.name} fill sizes="96px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 800, color: 'var(--accent)',
                    background: 'linear-gradient(135deg, var(--surface2), var(--surface))',
                  }}>
                    {member.name[0]}
                  </div>
                )}
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {member.name}
              </p>
              {member.character && (
                <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {member.character.split('/')[0].trim()}
                </p>
              )}
            </Link>
          )
        })}
      </div>
      <style>{`
        .cast-photo { transition: transform .3s var(--ease-out), box-shadow .3s var(--ease-out); }
        .cast-photo:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.3); }
      `}</style>
    </div>
  )
}
