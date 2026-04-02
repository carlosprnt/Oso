const S = 'bg-[#EBEBEB] dark:bg-[#2C2C2E] animate-pulse rounded-lg'

export default function CalendarLoading() {
  return (
    <div className="space-y-4 px-4 pt-4">
      {/* Month header */}
      <div className="flex items-center justify-between mb-2">
        <div className={`${S} h-7 w-32`} />
        <div className="flex gap-2">
          <div className={`${S} w-9 h-9 rounded-full`} />
          <div className={`${S} w-9 h-9 rounded-full`} />
        </div>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {[...Array(7)].map((_, i) => (
          <div key={i} className={`${S} h-4 rounded-sm mx-auto w-6`} />
        ))}
      </div>

      {/* Calendar grid — 5 rows × 7 cols */}
      {[...Array(5)].map((_, row) => (
        <div key={row} className="grid grid-cols-7 gap-1">
          {[...Array(7)].map((_, col) => (
            <div
              key={col}
              className={`${S} rounded-xl`}
              style={{ aspectRatio: '1' }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
