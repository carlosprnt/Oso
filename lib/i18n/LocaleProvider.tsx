'use client'

import { createContext, useContext } from 'react'
import { getT, type Locale } from './translations'

type TFn = ReturnType<typeof getT>

const LocaleCtx = createContext<{ locale: Locale; t: TFn }>({
  locale: 'en',
  t: getT('en'),
})

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <LocaleCtx.Provider value={{ locale, t: getT(locale) }}>
      {children}
    </LocaleCtx.Provider>
  )
}

export function useT() {
  return useContext(LocaleCtx).t
}

export function useLocale() {
  return useContext(LocaleCtx).locale
}
