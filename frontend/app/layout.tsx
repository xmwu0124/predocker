import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PreDocker - Pre-Doctoral Application Tracker',
  description: 'Track and manage your pre-doctoral research position applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
