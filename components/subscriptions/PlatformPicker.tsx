'use client'

import { useState } from 'react'
import { Search, PenLine } from 'lucide-react'
import { PLATFORMS, getPlatformLogoUrl, type PlatformPreset } from '@/lib/constants/platforms'
import SubscriptionAvatar from './SubscriptionAvatar'

interface PlatformPickerProps {
  onSelect: (platform: PlatformPreset | null) => void
}

export default function PlatformPicker({ onSelect }: PlatformPickerProps) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? PLATFORMS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : PLATFORMS

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="px-5 pt-4 pb-3 flex-shrink-0">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A3A3A3] pointer-events-none"
          />
          <input
            autoFocus
            type="text"
            placeholder="Search platforms…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F5] rounded-xl text-sm text-[#121212] placeholder:text-[#A3A3A3] outline-none focus:ring-2 focus:ring-[#121212]/10 transition-all"
          />
        </div>
      </div>

      {/* Manual entry */}
      <div className="px-5 pb-3 flex-shrink-0">
        <button
          onClick={() => onSelect(null)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[#D4D4D4] hover:border-[#A3A3A3] hover:bg-[#FAFAFA] transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
            <PenLine size={15} className="text-[#616161]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#121212]">Enter manually</p>
            <p className="text-xs text-[#616161]">Any custom service or subscription</p>
          </div>
        </button>
      </div>

      {/* Section label */}
      {!query && (
        <div className="px-5 pb-2 flex-shrink-0">
          <p className="text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider">
            Popular platforms
          </p>
        </div>
      )}

      {/* Scrollable platform list */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <p className="text-sm text-[#616161] mb-3">No results for &ldquo;{query}&rdquo;</p>
            <button
              onClick={() => onSelect(null)}
              className="text-sm font-medium text-[#121212] underline underline-offset-2"
            >
              Enter manually instead
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map(platform => (
              <button
                key={platform.slug}
                onClick={() => onSelect(platform)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
              >
                <SubscriptionAvatar
                  name={platform.name}
                  logoUrl={getPlatformLogoUrl(platform.domain)}
                  size="sm"
                />
                <span className="text-sm font-medium text-[#121212]">{platform.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
