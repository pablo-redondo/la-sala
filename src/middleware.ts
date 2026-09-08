import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    '/movie/:path*',
    '/tv/:path*',
    '/tmdb/:path*',
    '/person/:path*',
    '/search',
    '/discover',
  ],
}

const WINDOW_MS = 60_000
const MAX_REQUESTS = 60
const MAX_TRACKED_IPS = 5000

// Per-instance, in-memory limiter — Vercel can route requests to multiple
// isolated middleware instances, so this caps a single instance's exposure
// rather than guaranteeing one global ceiling. It's enough to stop a naive
// scraping loop; pair with Vercel Firewall for a hard account-wide limit.
const hits = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: NextRequest): string {
  // Cloudflare sets this at the edge from the real TCP connection, so unlike
  // x-forwarded-for it can't be spoofed by the client. Fall back to XFF for
  // non-Cloudflare environments (e.g. local dev behind a plain proxy).
  const cfIp = req.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

export function middleware(req: NextRequest) {
  const ip = getClientIp(req)
  const now = Date.now()
  const entry = hits.get(ip)

  if (!entry || now > entry.resetAt) {
    if (hits.size > MAX_TRACKED_IPS) {
      for (const [key, value] of hits) {
        if (now > value.resetAt) hits.delete(key)
      }
    }
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  entry.count++
  if (entry.count > MAX_REQUESTS) {
    return new NextResponse('Demasiadas solicitudes. Inténtalo de nuevo en un minuto.', {
      status: 429,
      headers: { 'Retry-After': '60' },
    })
  }

  return NextResponse.next()
}
