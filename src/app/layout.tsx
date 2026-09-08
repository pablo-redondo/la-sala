import type { Metadata } from 'next'
import { Bricolage_Grotesque, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-bricolage' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-space' })

export const metadata: Metadata = {
  title: 'La Sala — Descubre películas y series',
  description: 'Explora las mejores películas y series, gestiona tu watchlist y descubre tendencias.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bricolage.variable} ${spaceGrotesk.variable}`}>
      <body style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
