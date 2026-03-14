import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'County Health Analytics — Mini Project 2a',
  description: 'PCA, K-Means, and Visual Analytics on County Health Data',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
