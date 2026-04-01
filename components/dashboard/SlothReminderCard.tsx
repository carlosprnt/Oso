'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

function SlothIllustration() {
  return (
    <svg
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Branch */}
      <rect x="8" y="18" width="94" height="7" rx="3.5" fill="#7C5C2E" opacity="0.9" />

      {/* Left arm */}
      <path d="M38 36 Q30 26 39 20" stroke="#A0784A" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Left claw */}
      <circle cx="39" cy="19" r="5" fill="#7C5C2E" />
      <path d="M36 16 Q39 13 42 16" stroke="#5C3D18" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Right arm */}
      <path d="M72 36 Q80 26 71 20" stroke="#A0784A" strokeWidth="7" strokeLinecap="round" fill="none" />
      {/* Right claw */}
      <circle cx="71" cy="19" r="5" fill="#7C5C2E" />
      <path d="M68 16 Q71 13 74 16" stroke="#5C3D18" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Body */}
      <ellipse cx="55" cy="68" rx="24" ry="20" fill="#C4956A" />

      {/* Belly patch */}
      <ellipse cx="55" cy="72" rx="14" ry="12" fill="#E8C89A" opacity="0.7" />

      {/* Face */}
      <ellipse cx="55" cy="58" rx="18" ry="16" fill="#DBA878" />
      {/* Face light patch */}
      <ellipse cx="55" cy="61" rx="13" ry="11" fill="#EDD4A8" />

      {/* Eye rings */}
      <circle cx="48" cy="55" r="6.5" fill="#6B4520" />
      <circle cx="62" cy="55" r="6.5" fill="#6B4520" />
      {/* Eyes */}
      <circle cx="48" cy="55" r="4.5" fill="#1A0F00" />
      <circle cx="62" cy="55" r="4.5" fill="#1A0F00" />
      {/* Eye shine */}
      <circle cx="49.5" cy="53" r="1.5" fill="white" />
      <circle cx="63.5" cy="53" r="1.5" fill="white" />

      {/* Nose */}
      <ellipse cx="55" cy="63" rx="4.5" ry="3" fill="#A05C30" />
      <ellipse cx="55" cy="62.5" rx="3" ry="1.5" fill="#C4784A" opacity="0.5" />

      {/* Sleepy smile */}
      <path d="M49 68 Q55 73 61 68" stroke="#8B4E28" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Left lazy leg */}
      <path d="M37 80 Q30 92 35 98" stroke="#A0784A" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M33 96 Q35 100 39 97" stroke="#7C5C2E" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Right lazy leg */}
      <path d="M73 80 Q80 92 75 98" stroke="#A0784A" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M73 97 Q77 100 79 96" stroke="#7C5C2E" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Z Z Z  — sleepy */}
      <text x="78" y="46" fontSize="10" fontWeight="700" fill="white" opacity="0.7" fontFamily="system-ui">z</text>
      <text x="86" y="36" fontSize="8" fontWeight="700" fill="white" opacity="0.5" fontFamily="system-ui">z</text>
      <text x="92" y="28" fontSize="6" fontWeight="700" fill="white" opacity="0.35" fontFamily="system-ui">z</text>
    </svg>
  )
}

export default function SlothReminderCard() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      className="relative overflow-hidden rounded-[20px]"
      style={{
        background: 'linear-gradient(135deg, #2D2B8F 0%, #4A3FA8 45%, #6B5FD4 100%)',
      }}
    >
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.15)' }}
        aria-label="Cerrar"
      >
        <X size={13} color="white" strokeWidth={2.5} />
      </button>

      {/* Soft glow blob */}
      <div
        className="absolute -top-8 -left-8 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.07)', filter: 'blur(24px)' }}
      />

      {/* Top: illustration + tag row */}
      <div className="flex items-start pt-4 px-5 pr-14">
        <div className="w-[90px] flex-shrink-0 -mt-1 -ml-2">
          <SlothIllustration />
        </div>
        <div className="flex-1 pt-2 pl-2">
          <span
            className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
          >
            Para ti
          </span>
          <h3 className="text-[17px] font-bold text-white leading-snug">
            Tienes 2 renovaciones anuales sin aviso
          </h3>
        </div>
      </div>

      {/* Bottom: description + CTA side by side */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-3">
        <p className="flex-1 text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
          Activa un recordatorio y te avisaremos antes del cobro para que no se te pase.
        </p>
        <button
          className="flex-shrink-0 h-10 px-4 rounded-full text-[13px] font-semibold transition-opacity active:opacity-70"
          style={{ background: 'white', color: '#2D2B8F' }}
        >
          Avisarme 7 días antes
        </button>
      </div>
    </div>
  )
}
