'use client'

import { useEffect } from 'react'
import { UserSettings } from '@/lib/habits'

interface ThemeProviderProps {
  theme: UserSettings['theme']
  children: React.ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System preference
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const update = () => {
        if (mq.matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
      update()
      mq.addEventListener('change', update)
      return () => mq.removeEventListener('change', update)
    }
  }, [theme])

  return <>{children}</>
}
