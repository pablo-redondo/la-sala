export const revalidate = 3600

import { getTrendingMovies, getTrendingTV, discoverMovies, discoverTV, getTopRatedMovies, getTopRatedTV, getNowPlaying } from '@/services/tmdb'
import TmdbCarousel from '@/components/TmdbCarousel'
import TmdbHero from '@/components/TmdbHero'

export default async function HomePage() {
  const [
    trending,
    trendingTV,
    scifiMovies,
    thrillerMovies,
    classicMovies,
    crimeTV,
    comedyTV,
    topMovies,
    topTV,
    nowPlaying,
  ] = await Promise.all([
    getTrendingMovies(),
    getTrendingTV(),
    discoverMovies({ with_genres: '878', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverMovies({ with_genres: '53', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverMovies({ sort_by: 'vote_average.desc', 'vote_count.gte': '5000', 'primary_release_date.lte': '2000-12-31' }),
    discoverTV({ with_genres: '80', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    discoverTV({ with_genres: '35', sort_by: 'popularity.desc', 'vote_count.gte': '100' }),
    getTopRatedMovies(),
    getTopRatedTV(),
    getNowPlaying(),
  ])

  const heroItems = trending.filter(m => m.backdrop_path).slice(0, 7)
  const f = (r: { results: import('@/services/tmdb').TmdbMovieResult[] }) =>
    r.results.filter(m => m.poster_path).slice(0, 16)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <TmdbHero items={heroItems} type="movie" />

      <div style={{ paddingTop: 40, paddingBottom: 72, display: 'flex', flexDirection: 'column', gap: 56 }}>
        {nowPlaying.filter(m => m.poster_path).length > 0 && (
          <TmdbCarousel
            items={nowPlaying.filter(m => m.poster_path).slice(0, 14)}
            title="En cines ahora"
            subtitle="Cartelera actual"
            type="movie"
            viewAllHref="/estrenos"
          />
        )}
        <TmdbCarousel items={trending.slice(0, 16)} title="Tendencias esta semana" subtitle="Las más vistas ahora mismo" type="movie" viewAllHref="/movies" />
        <TmdbCarousel items={trendingTV.slice(0, 16)} title="Series en tendencia" subtitle="Los shows del momento" type="tv" viewAllHref="/tv" />
        <TmdbCarousel items={topMovies.slice(0, 16)} title="Mejores películas de la historia" subtitle="Mejor valoradas por la comunidad" type="movie" viewAllHref="/top#movies" />
        <TmdbCarousel items={topTV.slice(0, 16)} title="Mejores series de la historia" subtitle="Las más aclamadas" type="tv" viewAllHref="/top#tv" />
        <TmdbCarousel items={f(scifiMovies)} title="Ciencia ficción" type="movie" viewAllHref="/discover?genre=878&type=movie" />
        <TmdbCarousel items={f(thrillerMovies)} title="Thriller & Suspense" type="movie" viewAllHref="/discover?genre=53&type=movie" />
        <TmdbCarousel items={f(classicMovies)} title="Clásicos del cine" subtitle="Obras maestras de siempre" type="movie" />
        <TmdbCarousel items={f(crimeTV)} title="Crimen & Misterio" type="tv" viewAllHref="/discover?genre=80&type=tv" />
        <TmdbCarousel items={f(comedyTV)} title="Comedia" type="tv" viewAllHref="/discover?genre=35&type=tv" />
      </div>
    </div>
  )
}
