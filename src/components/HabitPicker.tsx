'use client'

import { memo, useMemo, useCallback } from 'react'
import { DEFAULT_HABITS, Allocations, Habit, CATEGORIES } from '@/lib/habits'

interface HabitPickerProps {
  allocations: Allocations
  onAdd: (habitId: string) => void
  availableBlocks: number
  allHabits?: readonly Habit[]
}

interface HabitChipProps {
  habit: Habit
  isActive: boolean
  isDisabled: boolean
  onClick: () => void
}

const HabitChip = memo(function HabitChip({
  habit,
  isActive,
  isDisabled,
  onClick,
}: HabitChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        flex items-center gap-1.5 px-3.5 py-2.5 rounded-ios text-[15px] font-medium
        transition-all duration-200 ios-press
        ${isActive ? 'text-white shadow-ios-lg' : 'bg-ios-card text-ios-text shadow-ios'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={isActive ? { backgroundColor: habit.color } : undefined}
      aria-pressed={isActive}
    >
      <span>{habit.emoji}</span>
      <span>{habit.name}</span>
      <span className="text-[12px] opacity-70 ml-0.5">
        {habit.baseReturn >= 0 ? '+' : ''}
        {habit.baseReturn}%
      </span>
    </button>
  )
})

export const HabitPicker = memo(function HabitPicker({
  allocations,
  onAdd,
  availableBlocks,
  allHabits = DEFAULT_HABITS,
}: HabitPickerProps) {
  const handleAdd = useCallback(
    (habitId: string) => {
      onAdd(habitId)
    },
    [onAdd]
  )

  const habitsByCategory = useMemo(() => {
    return CATEGORIES.map(category => ({
      ...category,
      habits: allHabits.filter(h => h.category === category.key),
    }))
  }, [allHabits])

  return (
    <div>
      <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
        Invest Your Time
      </div>

      {habitsByCategory.map(category => (
        <div key={category.key} className="mb-4">
          <div
            className={`text-[12px] font-medium mb-2 px-1 ${
              category.key === 'drain' ? 'text-ios-red' : 'text-ios-text-secondary'
            }`}
          >
            {category.icon} {category.label}
          </div>

          <div className="flex flex-wrap gap-2">
            {category.habits.map(habit => {
              const isActive = allocations[habit.id] > 0
              const isDisabled = availableBlocks === 0 && !isActive

              return (
                <HabitChip
                  key={habit.id}
                  habit={habit}
                  isActive={isActive}
                  isDisabled={isDisabled}
                  onClick={() => handleAdd(habit.id)}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
})
