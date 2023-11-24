import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Админская панель - Contact',
}

export default function EditContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
