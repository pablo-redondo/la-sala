import Image from 'next/image'
import type { WatchProviders } from '@/services/tmdb'

const LOGO_BASE = 'https://image.tmdb.org/t/p/original'

function ProviderLogo({ name, logo_path }: { name: string; logo_path: string }) {
  return (
    <div title={name} style={{
      width: 44, height: 44, borderRadius: 10, overflow: 'hidden', transition: 'transform .2s var(--ease-out)',
      border: '1px solid rgba(255,255,255,0.1)',
      flexShrink: 0, position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    }}>
      <Image
        src={`${LOGO_BASE}${logo_path}`}
        alt={name}
        fill
        sizes="44px"
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
}

type Props = {
  providers: WatchProviders
  tmdbLink?: string
}

export default function WatchProvidersSection({ providers, tmdbLink }: Props) {
  const hasAny = providers.flatrate?.length || providers.rent?.length || providers.buy?.length
  const link = tmdbLink ?? providers.link

  if (!hasAny) {
    if (!link) return null
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Dónde verlo</p>
        <a href={link} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
          color: 'var(--muted)', fontSize: 12, fontWeight: 600,
          padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
        }}>
          Consultar disponibilidad en JustWatch ↗
        </a>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{
          fontSize: 11, fontWeight: 800, color: 'var(--muted)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          Dónde verlo
        </p>
        {tmdbLink && (
          <a
            href={tmdbLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 10, color: 'var(--muted)', textDecoration: 'none' }}
          >
            JustWatch ↗
          </a>
        )}
      </div>

      {providers.flatrate && providers.flatrate.length > 0 && (
        <div>
          <p style={{ fontSize: 10, color: 'rgba(134,239,172,0.8)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Incluido en suscripción
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {providers.flatrate.map(p => (
              <ProviderLogo key={p.provider_id} name={p.provider_name} logo_path={p.logo_path} />
            ))}
          </div>
        </div>
      )}

      {providers.rent && providers.rent.length > 0 && (
        <div>
          <p style={{ fontSize: 10, color: 'rgba(147,197,253,0.8)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Alquiler
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {providers.rent.map(p => (
              <ProviderLogo key={p.provider_id} name={p.provider_name} logo_path={p.logo_path} />
            ))}
          </div>
        </div>
      )}

      {providers.buy && providers.buy.length > 0 && (
        <div>
          <p style={{ fontSize: 10, color: 'rgba(252,211,77,0.8)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Compra
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {providers.buy.map(p => (
              <ProviderLogo key={p.provider_id} name={p.provider_name} logo_path={p.logo_path} />
            ))}
          </div>
        </div>
      )}

      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: -4 }}>
        Datos de JustWatch vía TMDB · Disponibilidad en España
      </p>
    </div>
  )
}
