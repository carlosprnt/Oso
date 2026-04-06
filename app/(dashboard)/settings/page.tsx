import type { Metadata } from 'next'
import { getPreferences } from './actions'
import SettingsView from './SettingsView'

export const metadata: Metadata = { title: 'Ajustes' }

export default async function SettingsPage() {
  const preferences = await getPreferences()
  return <SettingsView preferences={preferences} />
}
