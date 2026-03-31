'use client'

import { useEffect } from 'react'
import { useMotionValue } from 'framer-motion'

/**
 * Like Framer Motion's useScroll().scrollY but stays frozen at the saved
 * scroll position when the body is locked (position: fixed).
 * This prevents headers from reappearing when a modal locks the scroll.
 */
export function useEffectiveScrollY() {
  const scrollYMv = useMotionValue(
    typeof window !== 'undefined' ? window.scrollY : 0
  )

  useEffect(() => {
    function update() {
      if (document.body.style.position === 'fixed') {
        // Body is locked — read frozen position from top offset
        const top = parseInt(document.body.style.top || '0', 10)
        scrollYMv.set(Math.abs(top))
      } else {
        scrollYMv.set(window.scrollY)
      }
    }

    // Track scroll normally
    window.addEventListener('scroll', update, { passive: true })

    // Also react when body style changes (lock / unlock)
    const observer = new MutationObserver(update)
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })

    return () => {
      window.removeEventListener('scroll', update)
      observer.disconnect()
    }
  }, [scrollYMv])

  return scrollYMv
}
