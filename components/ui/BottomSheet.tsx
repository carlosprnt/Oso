'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Height of the sheet. Default: 'tall' (88dvh) */
  height?: 'auto' | 'tall' | 'full'
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 'tall',
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const heightCls = {
    auto: 'max-h-[90dvh]',
    tall: 'h-[88dvh]',
    full: 'h-[96dvh]',
  }[height]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-backdrop-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-white rounded-t-2xl
          flex flex-col
          ${heightCls}
          animate-slide-up
        `}
      >
        {/* Handle bar */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#D4D4D4] rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-[#E5E5E5]">
            <h2 className="text-base font-semibold text-[#121212]">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#616161] hover:bg-[#F5F5F5] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  )
}
