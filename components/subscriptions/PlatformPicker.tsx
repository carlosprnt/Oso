'use client'

import { PLATFORMS, resolvePlatformLogoUrl, type PlatformPreset } from '@/lib/constants/platforms'
import SubscriptionAvatar from './SubscriptionAvatar'

interface PlatformPickerProps {
  onSelect: (platform: PlatformPreset | null) => void
}

export default function PlatformPicker({ onSelect }: PlatformPickerProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable platform list */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="divide-y divide-[#E8E8E8] dark:divide-[#2C2C2E]">
          {PLATFORMS.map(platform => (
            <button
              key={platform.id}
              onClick={() => onSelect(platform)}
              className="w-full flex items-center gap-3 px-4 py-3 active:bg-white dark:active:bg-[#2C2C2E] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#E8E8E8] dark:border-[#3A3A3C] bg-white dark:bg-white">
                {resolvePlatformLogoUrl(platform) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolvePlatformLogoUrl(platform)!}
                    alt={platform.name}
                    width={32}
                    height={32}
                    className="w-[82%] h-[82%] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs font-semibold text-[#121212]">
                    {platform.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-base font-medium text-[#121212] dark:text-[#F2F2F7]">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
