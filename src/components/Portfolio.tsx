'use client'

import { memo, useMemo } from 'react'
import { DEFAULT_HABITS, Allocations, Habit } from '@/lib/habits'
import { calculateMultiplier, calculateHabitReturn, blocksToTime } from '@/lib/calculations'

interface PortfolioProps {
  allocations: Allocations
  streak: number
  onAdd: (habitId: string) => void
  onRemove: (habitId: string) => void
  availableBlocks: number
  allHabits?: readonly Habit[]
  onOpenTimeGrid?: () => void
}

interface PortfolioItemProps {
  habit: Habit
  blocks: number
  returnVal: number
  isLast: boolean
  onAdd: () => void
  onRemove: () => void
  addDisabled: boolean
  index: number
}

const PortfolioItem = memo(function PortfolioItem({
  habit,
  blocks,
  returnVal,
  isLast,
  onAdd,
  onRemove,
  addDisabled,
  index,
}: PortfolioItemProps) {
  return (
    <div
      className={`flex items-center px-4 py-3.5 animate-stagger-in ${!isLast ? 'border-b border-ios-separator' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg mr-3"
        style={{ backgroundColor: `${habit.color}15` }}
      >
        {habit.emoji}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="text-[17px] font-semibold text-ios-text mb-0.5">{habit.name}</div>
        <div className="text-[13px] text-ios-text-secondary">
          {blocksToTime(blocks)} · {blocks} blocks
        </div>
      </div>

      {/* Return */}
      <div className="text-right mr-3">
        <div
          className={`text-[17px] font-semibold ${
            returnVal >= 0 ? 'text-ios-green' : 'text-ios-red'
          }`}
        >
          {returnVal >= 0 ? '+' : ''}
          {returnVal.toFixed(1)}%
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={onRemove}
          className="w-8 h-8 rounded-full bg-ios-bg text-ios-text-secondary text-lg font-medium flex items-center justify-center ios-press"
          aria-label={`Remove block from ${habit.name}`}
        >
          −
        </button>
        <button
          onClick={onAdd}
          disabled={addDisabled}
          className="w-8 h-8 rounded-full text-white text-lg font-medium flex items-center justify-center ios-press disabled:opacity-40"
          style={{ backgroundColor: habit.color }}
          aria-label={`Add block to ${habit.name}`}
        >
          +
        </button>
      </div>
    </div>
  )
})

export const Portfolio = memo(function Portfolio({
  allocations,
  streak,
  onAdd,
  onRemove,
  availableBlocks,
  allHabits = DEFAULT_HABITS,
  onOpenTimeGrid,
}: PortfolioProps) {
  const multiplier = useMemo(() => calculateMultiplier(streak), [streak])

  const activeHabits = useMemo(
    () => allHabits.filter(h => allocations[h.id] > 0),
    [allocations, allHabits]
  )

  return (
    <div>
      <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
        Your Portfolio
      </div>

      {activeHabits.length === 0 ? (
        <div className="bg-ios-card rounded-ios-lg overflow-hidden shadow-ios p-8 flex flex-col items-center text-center">
          <span className="text-4xl mb-3">📊</span>
          <p className="text-[17px] font-semibold text-ios-text mb-1">No investments yet</p>
          <p className="text-[14px] text-ios-text-secondary mb-4">Start allocating blocks to build your portfolio</p>
          {onOpenTimeGrid && (
            <button
              onClick={onOpenTimeGrid}
              className="bg-ios-blue text-white text-[15px] font-semibold px-5 py-2.5 rounded-ios ios-press"
            >
              Schedule Your Day
            </button>
          )}
        </div>
      ) : (
        <div className="bg-ios-card rounded-ios-lg overflow-hidden shadow-ios">
          {activeHabits.map((habit, idx) => {
            const blocks = allocations[habit.id]
            const returnVal = calculateHabitReturn(habit, blocks, multiplier)

            return (
              <PortfolioItem
                key={habit.id}
                habit={habit}
                blocks={blocks}
                returnVal={returnVal}
                isLast={idx === activeHabits.length - 1}
                onAdd={() => onAdd(habit.id)}
                onRemove={() => onRemove(habit.id)}
                addDisabled={availableBlocks === 0}
                index={idx}
              />
            )
          })}
        </div>
      )}
    </div>
  )
})
