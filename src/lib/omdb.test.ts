import { describe, it, expect } from 'vitest'
import { normalizePoster } from './omdb'

describe('normalizePoster', () => {
  it('returns the URL unchanged when a real poster is present', () => {
    const url = 'https://m.media-amazon.com/images/poster.jpg'
    expect(normalizePoster(url)).toBe(url)
  })

  it("maps OMDb's 'N/A' placeholder to null", () => {
    expect(normalizePoster('N/A')).toBeNull()
  })

  it('treats an empty string as missing too', () => {
    expect(normalizePoster('')).toBeNull()
  })
})
