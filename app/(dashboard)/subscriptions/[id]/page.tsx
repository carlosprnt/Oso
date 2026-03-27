import { createClient } from '@/lib/supabase/server'
import { enrichSubscriptions } from '@/lib/calculations/subscriptions'
import type { Subscription } from '@/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SubscriptionDetail from '@/components/subscriptions/SubscriptionDetail'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { id } = await params
  const { data } = await supabase
    .from('subscriptions')
    .select('name')
    .eq('id', id)
    .single()
  return { title: data?.name ?? 'Subscription' }
}

export default async function SubscriptionDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const { id } = await params

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const [sub] = enrichSubscriptions([data as Subscription])

  return <SubscriptionDetail subscription={sub} />
}
