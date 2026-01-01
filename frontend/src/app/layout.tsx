import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Salon Booking Platform',
  description: 'Book your salon appointments online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
