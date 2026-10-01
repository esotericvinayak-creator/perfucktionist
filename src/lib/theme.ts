import { useEffect } from 'react'
import { useLocalState } from './storage'

export type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useLocalState<Theme>('theme', (document.documentElement.dataset.theme as Theme) ?? 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  return [theme, setTheme] as const
}
