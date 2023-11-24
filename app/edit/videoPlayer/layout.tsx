import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Админская панель - VideoPlayer',
}

export default function EditVideoPlayerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
