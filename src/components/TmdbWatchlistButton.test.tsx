import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TmdbWatchlistButton from './TmdbWatchlistButton'
import { isInTmdbWatchlist } from '@/lib/tmdb-watchlist'

const PROPS = {
  tmdbId: 550,
  type: 'movie' as const,
  title: 'Fight Club',
  posterPath: '/x.jpg',
  year: '1999',
  rating: 8.4,
}

describe('TmdbWatchlistButton', () => {
  beforeEach(() => localStorage.clear())

  it('renders the "add" state and persists nothing until clicked', () => {
    render(<TmdbWatchlistButton {...PROPS} />)
    expect(screen.getByText('Añadir a mi lista')).toBeInTheDocument()
    expect(isInTmdbWatchlist(PROPS.tmdbId, PROPS.type)).toBe(false)
  })

  it('adds the item to the watchlist on click and flips its own label', () => {
    render(<TmdbWatchlistButton {...PROPS} />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('En mi lista')).toBeInTheDocument()
    expect(isInTmdbWatchlist(PROPS.tmdbId, PROPS.type)).toBe(true)
  })

  it('removes the item again on a second click (toggle behavior)', () => {
    render(<TmdbWatchlistButton {...PROPS} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    expect(screen.getByText('Añadir a mi lista')).toBeInTheDocument()
    expect(isInTmdbWatchlist(PROPS.tmdbId, PROPS.type)).toBe(false)
  })
})
