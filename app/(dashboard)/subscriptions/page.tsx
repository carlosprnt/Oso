import { createClient } from '@/lib/supabase/server'
import { enrichSubscriptions, getDashboardStats, getHighestCostSubscription, getTopSpendCategories, getUpcomingRenewals } from '@/lib/calculations/subscriptions'
import type { Subscription, SubscriptionStatus, Category } from '@/types'
import SubscriptionsView from '@/components/subscriptions/SubscriptionsView'
import DragToRevealSurface from '@/components/subscriptions/DragToRevealSurface'
import AnalyticsLayer from '@/components/subscriptions/AnalyticsLayer'
import ScreenTracker from '@/lib/analytics/ScreenTracker'
import AddSubscriptionFlow from '@/components/subscriptions/AddSubscriptionFlow'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Subscriptions' }

interface PageProps {
  searchParams: Promise<{ status?: string; category?: string; new?: string }>
}

export default async function SubscriptionsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const { data: { user } } = await supabase.auth.getUser()
  const firstName = (user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? '').split(' ')[0]

  const { data: rawSubs } = await supabase
    .from('subscriptions')
    .select('*')
    .order('name', { ascending: true })

  const allSubs = enrichSubscriptions((rawSubs ?? []) as Subscription[])

  let filtered = allSubs
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter(s => s.status === (params.status as SubscriptionStatus))
  }
  if (params.category && params.category !== 'all') {
    filtered = filtered.filter(s => s.category === (params.category as Category))
  }

  const stats = getDashboardStats(allSubs)
  const sharedCount = allSubs.filter(s => s.is_shared && (s.status === 'active' || s.status === 'trial')).length
  const mostExpensive = getHighestCostSubscription(allSubs)
  const topCategory = getTopSpendCategories(allSubs, 1)[0] ?? null
  const nextRenewal = getUpcomingRenewals(allSubs, 365)[0] ?? null

  return (
    <>
      <ScreenTracker kind="subscriptions" subscriptionCount={allSubs.length} />
      <DragToRevealSurface
        analytics={
          <AnalyticsLayer
            stats={stats}
            sharedCount={sharedCount}
            firstName={firstName}
            mostExpensiveName={mostExpensive?.name ?? null}
            mostExpensiveCost={mostExpensive ? mostExpensive.my_monthly_cost : 0}
            topCategoryName={topCategory?.category ?? null}
            nextRenewalName={nextRenewal?.subscription.name ?? null}
            nextRenewalDays={nextRenewal?.days_until ?? null}
          />
        }
      >
        <SubscriptionsView
          subscriptions={filtered}
          allCount={allSubs.length}
          stats={stats}
          currentStatus={params.status ?? 'all'}
          currentCategory={params.category ?? 'all'}
          newSubscriptionId={params.new}
        />
      </DragToRevealSurface>
      {/* Add button — desktop only; mobile uses floating nav "+" */}
      <div className="hidden sm:block fixed top-6 right-6 z-30">
        <AddSubscriptionFlow />
      </div>
    </>
  )
}
