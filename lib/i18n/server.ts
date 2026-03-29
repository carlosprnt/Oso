import { cookies } from 'next/headers'
import { getT, detectLocale, type Locale } from './translations'

export async function getServerT() {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('perezoso_locale')?.value ?? 'en') as Locale
  return getT(locale)
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return (cookieStore.get('perezoso_locale')?.value ?? 'en') as Locale
}

export { detectLocale }
