import '../node_modules/modern-normalize/modern-normalize.css'
import './globals.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import '@mantine/core/styles.css'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import ReactQueryProvider from './components/ReactQueryProvider'
import AppWrapper from './components/AppWrapper'
import AuthProvider from './components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Админская панель',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='ru'>
      <head>
        <ColorSchemeScript />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </head>
      <body className={inter.className}>
        <MantineProvider>
          <ReactQueryProvider>
            <AuthProvider>
              <AppWrapper>{children}</AppWrapper>
            </AuthProvider>
          </ReactQueryProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
