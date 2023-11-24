import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Админская панель - Sponsors',
}

export default function EditSponsorsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
