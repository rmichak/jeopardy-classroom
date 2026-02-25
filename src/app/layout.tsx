import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jeopardy! — Classroom Edition',
  description: 'A web-based Jeopardy game for classroom use with auto-scoring, save/load, and projector-friendly display.',
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
