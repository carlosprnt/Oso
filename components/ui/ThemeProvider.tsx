'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type Preference = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  /** Resolved theme currently applied to the DOM. */
  theme: Theme
  /** User's preference — may be 'system'. */
  preference: Preference
  /** Toggle between light/dark, setting an explicit preference. */
  toggle: () => void
  /** Set an explicit preference (including 'system'). */
  setPreference: (p: Preference) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  preference: 'light',
  toggle: () => {},
  setPreference: () => {},
})
export function useTheme() { return useContext(ThemeContext) }

function resolve(pref: Preference): Theme {
  if (pref === 'system') {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return pref
}

function apply(t: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', t === 'dark')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPref] = useState<Preference>('light')
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('perezoso_theme') as Preference | null
      const p: Preference = stored === 'dark' || stored === 'system' ? stored : stored === 'light' ? 'light' : 'light'
      setPref(p)
      const t = resolve(p)
      setTheme(t)
      apply(t)
    } catch { /* localStorage unavailable */ }
  }, [])

  // React to OS theme changes while in 'system' mode.
  useEffect(() => {
    if (preference !== 'system' || typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const t: Theme = mq.matches ? 'dark' : 'light'
      setTheme(t)
      apply(t)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  function setPreference(p: Preference) {
    setPref(p)
    try { localStorage.setItem('perezoso_theme', p) } catch { /* ignore */ }
    const t = resolve(p)
    setTheme(t)
    apply(t)
  }

  function toggle() {
    setPreference(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, preference, toggle, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

