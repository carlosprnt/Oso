'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import LoginForm from './LoginForm'

// ─── Logo tile configuration ────────────────────────────────────────────────
// Positions are TOP-LEFT anchor of each tile as % of viewport
// cx/cy below are the logical center positions from the spec
interface FloatingLogo {
  id: string
  src: string
  bg: string | null
  gradient?: string
  size: number
  radius: number
  left: string   // top-left corner % (cx - half size)
  top: string    // top-left corner % (cy - half size)
  xKeys: number[]
  yKeys: number[]
  duration: number
  delay: number
}

const LOGOS: FloatingLogo[] = [
  {
    id: 'google',
    src: 'https://logo.clearbit.com/google.com',
    bg: '#FFFFFF',
    size: 80, radius: 20,
    left: '5%',  top: '14%',
    xKeys:  [0,  7,  2, -5,  0],
    yKeys:  [0, -5,  9,  3,  0],
    duration: 7.2, delay: 0,
  },
  {
    id: 'netflix',
    src: 'https://logo.clearbit.com/netflix.com',
    bg: '#000000',
    size: 80, radius: 22,
    left: '65%', top: '12%',
    xKeys:  [0, -6, -2,  5,  0],
    yKeys:  [0,  8, -4,  6,  0],
    duration: 8.1, delay: 1.2,
  },
  {
    id: 'notion',
    src: 'https://logo.clearbit.com/notion.so',
    bg: '#FFFFFF',
    size: 76, radius: 20,
    left: '19%', top: '40%',
    xKeys:  [0,  8,  3, -6,  0],
    yKeys:  [0,  4, -7,  5,  0],
    duration: 6.8, delay: 0.8,
  },
  {
    id: 'apple',
    src: 'https://logo.clearbit.com/apple.com',
    bg: '#FFFFFF',
    size: 76, radius: 20,
    left: '62%', top: '43%',
    xKeys:  [0, -6, -3,  7,  0],
    yKeys:  [0,  7, -3, -4,  0],
    duration: 9.2, delay: 2.1,
  },
  {
    id: 'revolut',
    src: 'https://logo.clearbit.com/revolut.com',
    bg: '#FFFFFF',
    size: 76, radius: 20,
    left: '11%', top: '58%',
    xKeys:  [0,  9,  4, -7,  0],
    yKeys:  [0, -5,  8,  2,  0],
    duration: 7.6, delay: 1.5,
  },
  {
    id: 'disney',
    src: 'https://logo.clearbit.com/disneyplus.com',
    bg: null,
    gradient: 'linear-gradient(135deg, #0D3B7A 0%, #1A7DCB 100%)',
    size: 82, radius: 22,
    left: '53%', top: '61%',
    xKeys:  [0, -7, -2,  6,  0],
    yKeys:  [0,  6, -5, -4,  0],
    duration: 8.4, delay: 0.5,
  },
]

export default function LoginScreen() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#ECECEC]">
      {/* ── Hero zone ──────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden">

        {/* Perezoso — center anchor with subtle float */}
        <motion.div
          className="absolute"
          style={{ left: '50%', marginLeft: -72, top: '22%' }}
          animate={{ y: [0, -2, 0, 2, 0] }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        >
          <Image
            src="/logo.png"
            alt="Perezoso"
            width={144}
            height={144}
            className="rounded-[34px]"
            priority
          />
        </motion.div>

        {/* Floating service logos */}
        {LOGOS.map(logo => (
          <motion.div
            key={logo.id}
            className="absolute cursor-pointer"
            style={{ left: logo.left, top: logo.top }}
            animate={{ x: logo.xKeys, y: logo.yKeys }}
            transition={{
              duration: logo.duration,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: logo.delay,
            }}
            whileTap={{ scale: 1.1, rotate: 4 }}
          >
            <div
              style={{
                width: logo.size,
                height: logo.size,
                borderRadius: logo.radius,
                background: logo.gradient ?? (logo.bg as string),
                boxShadow: '0 2px 10px rgba(0,0,0,0.10)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src={logo.src}
                alt={logo.id}
                width={logo.size}
                height={logo.size}
                className="w-full h-full object-contain p-[12%]"
                unoptimized
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Sign-in card — anchored at bottom ──────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-[0_2px_20px_rgba(0,0,0,0.07)] p-6">
          <h1 className="text-2xl font-bold text-[#121212] mb-1">Sign in</h1>
          <p className="text-sm text-[#616161] mb-5">
            Continue with your Google account to get started.
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
