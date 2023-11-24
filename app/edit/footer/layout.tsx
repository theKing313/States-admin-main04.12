import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Админская панель - Footer',
}

export default function EditFooterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
