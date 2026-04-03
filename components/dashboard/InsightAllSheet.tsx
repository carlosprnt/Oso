'use client'

import BottomSheet from '@/components/ui/BottomSheet'
import InsightCard from './SavingsOpportunityCard'
import { useT } from '@/lib/i18n/LocaleProvider'
import type { SavingsOpportunity } from '@/lib/calculations/savings'

interface Props {
  isOpen: boolean
  onClose: () => void
  opportunities: SavingsOpportunity[]
  onDetail: (opp: SavingsOpportunity) => void
}

export default function InsightAllSheet({ isOpen, onClose, opportunities, onDetail }: Props) {
  const t = useT()

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('savings.allTitle')} height="tall" zIndex={300}>
      <div className="px-5 pt-2 pb-8 space-y-3">
        {opportunities.length === 0 ? (
          <p className="text-center text-[14px] text-[#8E8E93] py-10">{t('savings.allEmpty')}</p>
        ) : (
          opportunities.map((opp, i) => (
            <InsightCard
              key={i}
              kind="savings"
              inModal
              opportunity={opp}
              onTap={() => { onDetail(opp); onClose() }}
            />
          ))
        )}
      </div>
    </BottomSheet>
  )
}
