'use client'

import { memo, useMemo } from 'react'

interface CategoryBreakdownProps {
  essential: number
  growth: number
  drain: number
}

export const CategoryBreakdown = memo(function CategoryBreakdown({ essential, growth, drain }: CategoryBreakdownProps) {
  const total = essential + growth + drain

  const segments = useMemo(() => {
    if (total === 0) return []

    const items = [
      { label: 'Blue Chips', value: essential, color: '#007AFF', icon: '💎' },
      { label: 'Growth', value: growth, color: '#34C759', icon: '📈' },
      { label: 'Drains', value: drain, color: '#FF3B30', icon: '⚠️' },
    ].filter(s => s.value > 0)

    let offset = 0
    return items.map(item => {
      const pct = (item.value / total) * 100
      const segment = { ...item, pct, offset }
      offset += pct
      return segment
    })
  }, [essential, growth, drain, total])

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-ios-text-secondary text-[13px]">
        No data yet
      </div>
    )
  }

  const circumference = 2 * Math.PI * 40
  let dashOffset = circumference * 0.25 // Start at top

  return (
    <div className="flex items-center gap-6">
      {/* Donut chart */}
      <div className="relative w-28 h-28 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--ios-separator)" strokeWidth="12" />

          {/* Segments */}
          {segments.map((seg, i) => {
            const dashLength = (seg.pct / 100) * circumference
            const offset = dashOffset
            dashOffset -= dashLength

            return (
              <circle
                key={seg.label}
                cx="50" cy="50" r="40"
                fill="none"
                stroke={seg.color}
                strokeWidth="12"
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-offset + circumference}
                strokeLinecap="round"
                className="transition-all duration-700"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <div>
              <div className="text-[13px] font-medium text-ios-text">
                {seg.icon} {seg.label}
              </div>
              <div className="text-[12px] text-ios-text-secondary">
                {seg.pct.toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
