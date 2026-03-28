'use client'

import { PenLine, Mail } from 'lucide-react'
import { PLATFORMS, resolvePlatformLogoUrl, type PlatformPreset } from '@/lib/constants/platforms'
import SubscriptionAvatar from './SubscriptionAvatar'

interface PlatformPickerProps {
  onSelect: (platform: PlatformPreset | null) => void
  onGmailSearch?: () => void
}

export default function PlatformPicker({ onSelect, onGmailSearch }: PlatformPickerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Action buttons — two-column large cards */}
      <div className={`px-5 pt-4 pb-3 flex-shrink-0 ${onGmailSearch ? 'grid grid-cols-2 gap-3' : ''}`}>
        {/* Gmail search */}
        {onGmailSearch && (
          <button
            onClick={onGmailSearch}
            className="flex flex-col items-center justify-center gap-2.5 px-3 py-5 rounded-2xl border border-[#3D3BF3] bg-[#F5F5FF] active:bg-[#EDEDFF] transition-colors text-center"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#3D3BF3] flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#3D3BF3] leading-snug">Search in Gmail</p>
              <p className="text-[11px] text-[#7B79F7] mt-0.5 leading-snug">Find receipts automatically</p>
            </div>
          </button>
        )}

        {/* Manual entry */}
        <button
          onClick={() => onSelect(null)}
          className="flex flex-col items-center justify-center gap-2.5 px-3 py-5 rounded-2xl border border-[#E8E8E8] bg-white active:bg-[#FAFAFA] transition-colors text-center"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#F5F5F5] border border-[#E8E8E8] flex items-center justify-center flex-shrink-0">
            <PenLine size={18} className="text-[#666666]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111111] leading-snug">Enter manually</p>
            <p className="text-[11px] text-[#999999] mt-0.5 leading-snug">Any service or subscription</p>
          </div>
        </button>
      </div>

      {/* Section label */}
      <div className="px-5 pb-2 flex-shrink-0">
        <p className="text-[11px] font-semibold text-[#AAAAAA] uppercase tracking-wider">
          Popular platforms
        </p>
      </div>

      {/* Scrollable platform list */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="space-y-0.5">
          {PLATFORMS.map(platform => (
            <button
              key={platform.id}
              onClick={() => onSelect(platform)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F5F5F5] transition-colors text-left"
            >
              <SubscriptionAvatar
                name={platform.name}
                logoUrl={resolvePlatformLogoUrl(platform)}
                size="sm"
              />
              <span className="text-sm font-medium text-[#111111]">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
