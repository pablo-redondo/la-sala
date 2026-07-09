import { describe, it, expect, beforeEach } from 'vitest'
import {
  getTmdbWatchlist,
  addToTmdbWatchlist,
  removeFromTmdbWatchlist,
  isInTmdbWatchlist,
} from './tmdb-watchlist'

const ITEM = { tmdbId: 550, type: 'movie' as const, title: 'Fight Club', posterPath: '/x.jpg', year: '1999', rating: 8.4 }

describe('tmdb-watchlist', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty and reports items as not in the list', () => {
    expect(getTmdbWatchlist()).toEqual([])
    expect(isInTmdbWatchlist(ITEM.tmdbId, ITEM.type)).toBe(false)
  })

  it('adds an item and makes it findable by id + type', () => {
    addToTmdbWatchlist(ITEM)
    expect(isInTmdbWatchlist(ITEM.tmdbId, ITEM.type)).toBe(true)
    expect(getTmdbWatchlist()).toHaveLength(1)
  })

  it('does not duplicate an item already in the list — it moves it to the front instead', () => {
    addToTmdbWatchlist(ITEM)
    addToTmdbWatchlist({ ...ITEM, rating: 9.0 })
    const list = getTmdbWatchlist()
    expect(list).toHaveLength(1)
    expect(list[0].rating).toBe(9.0)
  })

  it('treats the same tmdbId as a different entry when the media type differs', () => {
    addToTmdbWatchlist(ITEM)
    addToTmdbWatchlist({ ...ITEM, type: 'tv' })
    expect(getTmdbWatchlist()).toHaveLength(2)
  })

  it('removes an item by id + type', () => {
    addToTmdbWatchlist(ITEM)
    removeFromTmdbWatchlist(ITEM.tmdbId, ITEM.type)
    expect(isInTmdbWatchlist(ITEM.tmdbId, ITEM.type)).toBe(false)
    expect(getTmdbWatchlist()).toEqual([])
  })
})
