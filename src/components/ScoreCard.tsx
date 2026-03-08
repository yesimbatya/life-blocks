'use client'

import { memo, useMemo } from 'react'
import { DEFAULT_HABITS, Allocations, Habit, TOTAL_BLOCKS } from '@/lib/habits'
import { calculateMultiplier, calculateTotalReturn, calculateUsedBlocks } from '@/lib/calculations'

interface ScoreCardProps {
  allocations: Allocations
  streak: number
  allHabits?: readonly Habit[]
}

export const ScoreCard = memo(function ScoreCard({ allocations, streak, allHabits = DEFAULT_HABITS }: ScoreCardProps) {
  const usedBlocks = useMemo(() => calculateUsedBlocks(allocations), [allocations])
  const availableBlocks = TOTAL_BLOCKS - usedBlocks

  const multiplier = useMemo(() => calculateMultiplier(streak), [streak])
  const totalReturn = useMemo(
    () => calculateTotalReturn(allocations, streak, allHabits),
    [allocations, streak, allHabits]
  )

  const allocationBars = useMemo(
    () =>
      allHabits.map(habit => {
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
    [allocations, allHabits]
  )

  const isEmpty = usedBlocks === 0

  return (
    <div className="bg-ios-card rounded-ios-xl p-6 shadow-ios">
      {/* Potential Score */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="text-[13px] text-ios-text-secondary font-medium mb-1 uppercase tracking-wide">
            Today&apos;s Potential
          </div>
          {isEmpty ? (
            <div className="text-[20px] font-semibold text-ios-text-secondary leading-tight mt-1">
              Plan your day to<br />see your returns
            </div>
          ) : (
            <div
              className={`text-[44px] font-bold tracking-tight leading-none ${
                totalReturn >= 0 ? 'text-ios-green' : 'text-ios-red'
              }`}
            >
              {totalReturn >= 0 ? '+' : ''}
              {totalReturn.toFixed(0)}%
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="bg-ios-bg px-3 py-1.5 rounded-full text-[13px] font-semibold text-ios-text-secondary">
            🔥 {streak} day streak
          </div>
          <div className="text-[12px] text-ios-text-secondary">{multiplier.toFixed(1)}x multiplier</div>
        </div>
      </div>

      {/* Allocation Bar */}
      <div className="mb-3">
        <div className="h-2 bg-ios-bg rounded-full overflow-hidden flex">
          {allocationBars}
        </div>
      </div>

      {/* Blocks Counter */}
      <div className="flex justify-between text-[13px] text-ios-text-secondary">
        <span>{usedBlocks} blocks invested</span>
        <span className={availableBlocks > 0 ? 'text-ios-green' : 'text-ios-orange'}>
          {availableBlocks} remaining
        </span>
      </div>
    </div>
  )
})
