'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CreditCard, CalendarDays } from 'lucide-react'
import Image from 'next/image'
import UserAvatarMenu from '@/components/dashboard/UserAvatarMenu'
import type { Profile } from '@/types'

const NAV_ITEMS = [
  { href: '/subscriptions', icon: CreditCard,      label: 'Subscriptions' },
  { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/calendar',      icon: CalendarDays,    label: 'Calendar' },
]

interface SidebarProps {
  profile: Profile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="
      hidden lg:flex flex-col
      w-56 min-h-screen
      bg-white dark:bg-[#1C1C1E] border-r border-[#E8E8E8] dark:border-[#2C2C2E]
      px-3 py-6
      fixed left-0 top-0 bottom-0
    ">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <Image
          src="/logo.png"
          alt="Oso"
          width={32}
          height={32}
          className="rounded-xl flex-shrink-0"
        />
        <span className="font-bold text-[#121212] dark:text-[#F2F2F7] text-base tracking-tight">Oso</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-[#121212] text-white dark:bg-[#F2F2F7] dark:text-[#121212]'
                  : 'text-[#424242] hover:bg-white hover:text-[#121212] dark:text-[#AEAEB2] dark:hover:bg-[#2C2C2E] dark:hover:text-[#F2F2F7]'
                }
              `}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User — avatar menu lives here on desktop, matching the
         FloatingNav layout on mobile. The menu dropdown exposes
         share, settings and sign out. */}
      <div className="border-t border-[#E8E8E8] dark:border-[#2C2C2E] pt-4 mt-4">
        <div className="flex items-center gap-2.5 px-1">
          <UserAvatarMenu />
          {profile?.full_name && (
            <p className="text-xs font-medium text-[#121212] dark:text-[#F2F2F7] truncate">
              {profile.full_name}
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
