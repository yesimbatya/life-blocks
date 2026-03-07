'use client'

import { memo, useMemo } from 'react'
import { HABITS, Allocations, TOTAL_BLOCKS } from '@/lib/habits'
import { calculateMultiplier, calculateTotalReturn, calculateUsedBlocks } from '@/lib/calculations'

interface ScoreCardProps {
  allocations: Allocations
  streak: number
}

export const ScoreCard = memo(function ScoreCard({ allocations, streak }: ScoreCardProps) {
  const usedBlocks = useMemo(() => calculateUsedBlocks(allocations), [allocations])
  const availableBlocks = TOTAL_BLOCKS - usedBlocks

  const multiplier = useMemo(() => calculateMultiplier(streak), [streak])
  const totalReturn = useMemo(
    () => calculateTotalReturn(allocations, streak),
    [allocations, streak]
  )

  const allocationBars = useMemo(
    () =>
      HABITS.map(habit => {
        const blocks = allocations[habit.id] || 0
        if (blocks === 0) return null
        return (
          <div
            key={habit.id}
            className="transition-all duration-300 ease-out"
            style={{
              width: `${blocks}%`,
              backgroundColor: habit.color,
            }}
          />
        )
      }).filter(Boolean),
    [allocations]
  )

  return (
    <div className="bg-white rounded-ios-xl p-6 shadow-ios">
      {/* Potential Score */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="text-[13px] text-ios-gray-1 font-medium mb-1 uppercase tracking-wide">
            Today&apos;s Potential
          </div>
          <div
            className={`text-[44px] font-bold tracking-tight leading-none ${
              totalReturn >= 0 ? 'text-ios-green' : 'text-ios-red'
            }`}
          >
            {totalReturn >= 0 ? '+' : ''}
            {totalReturn.toFixed(0)}%
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="bg-ios-gray-6 px-3 py-1.5 rounded-full text-[13px] font-semibold text-ios-gray-1">
            🔥 {streak} day streak
          </div>
          <div className="text-[12px] text-ios-gray-3">{multiplier.toFixed(1)}x multiplier</div>
        </div>
      </div>

      {/* Allocation Bar */}
      <div className="mb-3">
        <div className="h-2 bg-ios-gray-6 rounded-full overflow-hidden flex">
          {allocationBars}
        </div>
      </div>

      {/* Blocks Counter */}
      <div className="flex justify-between text-[13px] text-ios-gray-1">
        <span>{usedBlocks} blocks invested</span>
        <span className={availableBlocks > 0 ? 'text-ios-green' : 'text-ios-orange'}>
          {availableBlocks} remaining
        </span>
      </div>
    </div>
  )
})
