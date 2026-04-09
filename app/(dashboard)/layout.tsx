import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import FloatingNav from '@/components/layout/FloatingNav'
import SubscriptionToastHost from '@/components/dashboard/SubscriptionToastHost'
import { LocaleProvider } from '@/lib/i18n/LocaleProvider'
import { detectLocale } from '@/lib/i18n/translations'
import { SubscriptionProvider } from '@/lib/revenuecat/SubscriptionProvider'
import type { Profile } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Detect locale: Google metadata → Accept-Language header → 'en'
  const headersList = await headers()
  const googleLocale =
    user!.user_metadata?.locale ??
    user!.user_metadata?.language ??
    headersList.get('accept-language') ??
    null
  const detectedLocale = detectLocale(googleLocale)

  // Server-side Pro status from Supabase (web fallback; native reads from RC SDK)
  const initialIsPro = !!(profile as Profile & { is_pro?: boolean } | null)?.is_pro

  return (
    <LocaleProvider locale={detectedLocale}>
      <SubscriptionProvider userId={user.id} initialIsPro={initialIsPro}>
        <div className="min-h-screen bg-white dark:bg-[#121212] pt-[env(safe-area-inset-top)]">
          <Sidebar profile={profile as Profile | null} />

          <main className="lg:pl-56 pb-28 lg:pb-0 min-h-screen">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
              {children}
            </div>
          </main>

          {/*
            Top fade-out mask: a fixed overlay sitting at the very top
            of the viewport that backdrop-blurs whatever scrolls under
            it. The CSS mask-image makes the overlay fully opaque at
            the top edge and gradually transparent toward the bottom,
            so blur+opacity ramp up only when content is "almost
            leaving" the viewport from above.
          */}
          <div className="top-fade-mask" aria-hidden="true" />

          <FloatingNav />
          <SubscriptionToastHost />
        </div>
      </SubscriptionProvider>
    </LocaleProvider>
  )
}
