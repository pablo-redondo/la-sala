import MediaCard from './MediaCard'
import type { MediaItem } from '@/types/omdb'

type Props = {
  items: MediaItem[]
  title?: string
}

export default function MediaGrid({ items, title }: Props) {
  if (items.length === 0) return null

  return (
    <section>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 3, height: 20, background: 'var(--gradient)', borderRadius: 2, flexShrink: 0 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{title}</h2>
        </div>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 20,
      }}>
        {items.map((item) => (
          <MediaCard key={item.imdbID} item={item} />
        ))}
      </div>
    </section>
  )
}
