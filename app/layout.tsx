import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kalandor Kerék',
  description: 'WoW Classic kaszt randomizáló – pörgesd meg a Kalandor Kereket és tudd meg, melyik kaszttal játsz! Készítette: Alex Gabe.',
  generator: 'v0.dev',
  authors: [{ name: 'Alex Gabe' }],
  openGraph: {
    title: 'Kalandor Kerék',
    description: 'WoW Classic kaszt randomizáló – pörgesd meg a Kalandor Kereket és tudd meg, melyik kaszttal játsz! Készítette: Alex Gabe.',
    url: 'kalandor-kerek.vercel.app',
    siteName: 'Kalandor Kerék',
    images: [
      {
        url: '/thumb/kerek-thumb.jpg',
        width: 1200,
        height: 630,
        alt: 'Kalandor Kerék',
      },
    ],
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalandor Kerék',
    description: 'WoW Classic kaszt randomizáló – pörgesd meg a Kalandor Kereket és tudd meg, melyik kaszttal játsz! Készítette: Alex Gabe.',
    images: ['/thumb/kerek-thumb.jpg'],
    creator: 'Alex Gabe',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="hu">
      <head>
        {/* Google Fonts: Bebas Neue */}
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
        {/* Favicons */}
        <link rel="icon" href="/favicons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicons/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicons/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/favicons/web-app-manifest-512x512.png" />
        <meta property="og:image" content="/thumb/kerek-thumb.jpg" />
        <meta name="twitter:image" content="/thumb/kerek-thumb.jpg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
