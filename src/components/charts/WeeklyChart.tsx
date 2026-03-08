'use client'

import { memo, useMemo } from 'react'

interface WeeklyChartProps {
  data: { date: string; totalReturn: number }[]
}

export const WeeklyChart = memo(function WeeklyChart({ data }: WeeklyChartProps) {
  const last7 = data.slice(-7)
  const maxAbs = useMemo(() => {
    if (last7.length === 0) return 100
    return Math.max(...last7.map(d => Math.abs(d.totalReturn)), 1)
  }, [last7])

  if (last7.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-ios-text-secondary text-[13px]">
        No data yet
      </div>
    )
  }

  return (
    <div className="flex items-end justify-between gap-1.5 h-32 px-2">
      {last7.map((day, i) => {
        const heightPercent = (Math.abs(day.totalReturn) / maxAbs) * 100
        const isPositive = day.totalReturn >= 0
        const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)

        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-24 flex flex-col justify-end relative">
              {isPositive ? (
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                    background: `linear-gradient(180deg, var(--ios-green, #34C759) 0%, #30D158 100%)`,
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              ) : (
                <div className="w-full flex flex-col justify-end h-full">
                  <div
                    className="w-full rounded-b-md transition-all duration-500"
                    style={{
                      height: `${Math.max(heightPercent, 4)}%`,
                      background: `linear-gradient(180deg, var(--ios-red, #FF3B30) 0%, #FF453A 100%)`,
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                </div>
              )}
            </div>
            <span className="text-[10px] text-ios-text-secondary font-medium">{dayLabel}</span>
          </div>
        )
      })}
    </div>
  )
})
