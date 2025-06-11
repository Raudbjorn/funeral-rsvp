import type { Metadata } from 'next'
import { Inter, Crimson_Text } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })
const crimsonText = Crimson_Text({ 
  subsets: ['latin'], 
  weight: ['400', '600'],
  variable: '--font-crimson'
})

export const metadata: Metadata = {
  title: 'Funeral | Fríkirkjan í Hafnarfirði',
  description: 'Join us for a funeral service at Fríkirkjan í Hafnarfirði on June 16th, 2025 at 1:00 PM. RSVP, coordinate carpools, and share memories.',
  keywords: 'funeral, RSVP, carpool, Hafnarfjörður, Iceland, Fríkirkjan, jarðarför',
  authors: [{ name: 'Funeral Service Organizers' }],
  
  // Open Graph / Facebook
  openGraph: {
    title: 'Funeral | Fríkirkjan í Hafnarfirði',
    description: 'Join us for a funeral service on June 16th, 2025 at 1:00 PM. RSVP, coordinate carpools, and share memories.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://funeral-service.com',
    siteName: 'Funeral Service',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Funeral Service - June 16th, 2025',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Funeral | Fríkirkjan í Hafnarfirði',
    description: 'Join us for a funeral service on June 16th, 2025 at 1:00 PM.',
    images: ['/og-image.jpg'],
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  
  // Additional meta
  manifest: '/site.webmanifest',
  robots: 'index, follow',
  category: 'funeral service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${crimsonText.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}