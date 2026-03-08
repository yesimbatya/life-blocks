'use client'

import { memo, useMemo } from 'react'

interface HabitTrendProps {
  data: { date: string; blocks: number }[]
  color: string
}

export const HabitTrend = memo(function HabitTrend({ data, color }: HabitTrendProps) {
  const points = useMemo(() => {
    if (data.length < 2) return ''

    const maxBlocks = Math.max(...data.map(d => d.blocks), 1)
    const width = 100
    const height = 30
    const padding = 2

    return data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2)
      const y = height - padding - (d.blocks / maxBlocks) * (height - padding * 2)
      return `${x},${y}`
    }).join(' ')
  }, [data])

  if (data.length < 2) return null

  return (
    <svg viewBox="0 0 100 30" className="w-full h-8" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})
