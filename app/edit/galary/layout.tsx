import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Админская панель - GalarysScroll',
}

export default function EditGalarysScrollPage({ children }: { children: ReactNode }) {
  return <>{children}</>
}
