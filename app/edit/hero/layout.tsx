import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Админская панель - Hero',
}

export default function EditHeroLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
