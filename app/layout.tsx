import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Keep Calm & Roll — WoW Forever',
  description: 'Kaszt randomizer a Keep Calm and Wipe guild WoW Forever karaktereihez.',
  applicationName: 'Keep Calm & Roll',
  icons: { icon: '/logo/kcw-crest.png' },
  openGraph: {
    title: 'Keep Calm & Roll — WoW Forever',
    description: 'Ma mivel menjek? A Keep Calm and Wipe guild kaszt sorsolója.',
    siteName: 'Keep Calm and Wipe',
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Keep Calm & Roll — WoW Forever',
    description: 'Kaszt randomizer a Keep Calm and Wipe guild számára.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  )
}
