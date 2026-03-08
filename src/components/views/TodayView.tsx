'use client'

import { useState, useCallback, useMemo } from 'react'
import { TOTAL_BLOCKS, Habit, BlockAssignments, Allocations } from '@/lib/habits'
import { countUsedBlocks } from '@/lib/calculations'
import { ScoreCard } from '@/components/ScoreCard'
import { Portfolio } from '@/components/Portfolio'
import { HabitPicker } from '@/components/HabitPicker'
import { TimeGrid } from '@/components/TimeGrid'
import { Toast, useToast } from '@/components/Toast'
import { StreakBanner } from '@/components/StreakBanner'

interface TodayViewProps {
  blocks: BlockAssignments
  allocations: Allocations
  streak: number
  previousStreak: number | null
  allHabits: readonly Habit[]
  updateBlocks: (blocks: BlockAssignments) => void
}

export function TodayView({ blocks, allocations, streak, previousStreak, allHabits, updateBlocks }: TodayViewProps) {
  const [showTimeGrid, setShowTimeGrid] = useState(false)
  const [selectedGridHabit, setSelectedGridHabit] = useState<Habit | null>(null)
  const toast = useToast()

  const usedBlocks = useMemo(() => countUsedBlocks(blocks), [blocks])
  const availableBlocks = TOTAL_BLOCKS - usedBlocks

  const addBlock = useCallback(
    (habitId: string) => {
      if (availableBlocks <= 0) return
      const newBlocks = [...blocks]
      const emptyIndex = newBlocks.findIndex(b => b === null)
      if (emptyIndex !== -1) {
        newBlocks[emptyIndex] = habitId
        updateBlocks(newBlocks)
      }
    },
    [blocks, availableBlocks, updateBlocks]
  )

  const removeBlock = useCallback(
    (habitId: string) => {
      const newBlocks = [...blocks]
      for (let i = newBlocks.length - 1; i >= 0; i--) {
        if (newBlocks[i] === habitId) {
          newBlocks[i] = null
          updateBlocks(newBlocks)
          return
        }
      }
    },
    [blocks, updateBlocks]
  )

  const handleOpenTimeGrid = useCallback(() => setShowTimeGrid(true), [])
  const handleCloseTimeGrid = useCallback(() => {
    setShowTimeGrid(false)
    setSelectedGridHabit(null)
  }, [])
  const handleSelectGridHabit = useCallback((habit: Habit | null) => setSelectedGridHabit(habit), [])
  const handleUpdateBlocks = useCallback((newBlocks: BlockAssignments) => {
    updateBlocks(newBlocks)
    const used = newBlocks.filter(b => b !== null).length
    if (used > 0) {
      toast.show('Schedule saved', '✅')
    }
  }, [updateBlocks, toast])

  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="pb-24 pt-12">
      <Toast messages={toast.messages} onDismiss={toast.dismiss} />

      {/* Header */}
      <div className="px-5 mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-[34px] font-bold text-ios-text tracking-tight mb-1">Today</h1>
          <p className="text-[15px] text-ios-text-secondary">{dateString}</p>
        </div>
        <button
          onClick={handleOpenTimeGrid}
          className="mt-2 bg-ios-card rounded-ios-lg p-3 shadow-ios ios-press focus-visible:ring-2 focus-visible:ring-ios-blue focus-visible:ring-offset-2"
          aria-label="Open time grid"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ios-blue">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
            <path d="M9 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <rect x="6" y="13" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
            <rect x="10.5" y="13" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
            <rect x="15" y="13" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
            <rect x="6" y="17.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
            <rect x="10.5" y="17.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
          </svg>
        </button>
      </div>

      {/* Streak Banner */}
      <StreakBanner streak={streak} previousStreak={previousStreak} />

      {/* Score Card */}
      <div className="px-5 mb-6">
        <ScoreCard allocations={allocations} streak={streak} allHabits={allHabits} />
      </div>

      {/* Portfolio */}
      <div className="px-5 mb-6">
        <Portfolio
          allocations={allocations}
          streak={streak}
          onAdd={addBlock}
          onRemove={removeBlock}
          availableBlocks={availableBlocks}
          allHabits={allHabits}
          onOpenTimeGrid={handleOpenTimeGrid}
        />
      </div>

      {/* Habit Picker */}
      <div className="px-5 mb-6">
        <HabitPicker allocations={allocations} onAdd={addBlock} availableBlocks={availableBlocks} allHabits={allHabits} />
      </div>

      {/* Bottom Schedule Button */}
      <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-t from-ios-bg from-40% to-transparent pb-4 pt-6 flex justify-center z-30 pointer-events-none">
        <button
          onClick={handleOpenTimeGrid}
          className="bg-ios-blue text-white rounded-xl px-6 py-4 shadow-ios-lg flex items-center gap-3 ios-press pointer-events-auto focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
            <path d="M9 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M15 4V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[15px] font-semibold">Schedule Your Day</span>
        </button>
      </div>

      {/* Time Grid */}
      <TimeGrid
        isOpen={showTimeGrid}
        onClose={handleCloseTimeGrid}
        blocks={blocks}
        onUpdateBlocks={handleUpdateBlocks}
        selectedHabit={selectedGridHabit}
        onSelectHabit={handleSelectGridHabit}
        allHabits={allHabits}
      />
    </div>
  )
}
