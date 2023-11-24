import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Админская панель - twoSides',
}

export default function EditTwoSidesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
