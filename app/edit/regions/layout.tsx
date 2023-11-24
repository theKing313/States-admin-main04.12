import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Админская панель - Regions',
}

export default function RegionsPage({ children }: { children: ReactNode }) {
  return <>{children}</>
}
