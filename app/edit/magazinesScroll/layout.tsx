import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Админская панель - MagazinesScroll',
}

export default function EditMagazinesScrollLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
