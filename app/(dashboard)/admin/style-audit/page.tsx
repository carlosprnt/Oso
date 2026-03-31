import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StyleAuditClient from './StyleAuditClient'

const ADMIN_EMAIL = 'carlosprnt@gmail.com'

export const metadata = { title: 'Style Audit · Perezoso' }

export default async function StyleAuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')
  return <StyleAuditClient />
}
