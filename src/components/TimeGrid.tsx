'use client'

import { memo, useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { HABITS, Allocations, Habit, BlockAssignments, createEmptyBlocks, CATEGORIES } from '@/lib/habits'
import { blocksToTime, blocksToAllocations, countUsedBlocks } from '@/lib/calculations'

interface TimeGridProps {
  isOpen: boolean
  onClose: () => void
  blocks: BlockAssignments
  onUpdateBlocks: (blocks: BlockAssignments) => void
  selectedHabit: Habit | null
  onSelectHabit: (habit: Habit | null) => void
}

// 100 blocks = 1000 minutes = ~16.6 hours (6am to 10:40pm)
const START_HOUR = 6
const TOTAL_BLOCKS_COUNT = 100

interface TimeSlot {
  index: number
  hour: number
  minute: number
}

// Generate static time slot metadata (doesn't depend on allocations)
function generateTimeSlotMeta(): TimeSlot[] {
  const slots: TimeSlot[] = []
  for (let i = 0; i < TOTAL_BLOCKS_COUNT; i++) {
    const totalMinutes = i * 10
    slots.push({
      index: i,
      hour: START_HOUR + Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
    })
  }
  return slots
}

const TIME_SLOTS = generateTimeSlotMeta()

// Group slots by hour
const HOUR_GROUPS = (() => {
  const groups: { hour: number; label: string; ampm: string; slots: TimeSlot[] }[] = []
  let currentHour = -1

  TIME_SLOTS.forEach(slot => {
    if (slot.hour !== currentHour) {
      currentHour = slot.hour
      const h = slot.hour % 12 || 12
      groups.push({
        hour: slot.hour,
        label: String(h),
        ampm: slot.hour < 12 ? 'AM' : 'PM',
        slots: [],
      })
    }
    groups[groups.length - 1].slots.push(slot)
  })

  return groups
})()

const HabitPalette = memo(function HabitPalette({
  selectedHabit,
  onSelect,
  allocations,
}: {
  selectedHabit: Habit | null
  onSelect: (habit: Habit | null) => void
  allocations: Allocations
}) {
  return (
    <div className="space-y-3">
      {/* Eraser */}
      <button
        onClick={() => onSelect(null)}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ios-press
          ${selectedHabit === null
            ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg scale-[1.02]'
            : 'bg-white text-ios-text shadow-ios hover:shadow-ios-lg'
          }
        `}
      >
        <span className="text-lg">🧹</span>
        <span className="text-[14px] font-medium">Clear</span>
      </button>

      {/* Habit categories */}
      {CATEGORIES.map(category => {
        const categoryHabits = HABITS.filter(h => h.category === category.key)
        return (
          <div key={category.key}>
            <span className={`
              text-[10px] uppercase tracking-wider font-semibold px-1 mb-1.5 block
              ${category.key === 'drain' ? 'text-ios-red' : 'text-ios-gray-2'}
            `}>
              {category.icon} {category.label}
            </span>
            <div className="flex gap-2 flex-wrap">
              {categoryHabits.map(habit => {
                const count = allocations[habit.id] || 0
                const isSelected = selectedHabit?.id === habit.id

                return (
                  <button
                    key={habit.id}
                    onClick={() => onSelect(habit)}
                    className={`
                      relative flex items-center gap-2 px-3 py-2.5 rounded-xl
                      transition-all duration-200 ios-press
                      ${isSelected
                        ? 'text-white shadow-lg scale-[1.02]'
                        : 'bg-white text-ios-text shadow-ios hover:shadow-ios-lg'
                      }
                    `}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${habit.color} 0%, ${habit.color}DD 100%)`
                        : undefined,
                    }}
                  >
                    <span className={`
                      text-lg w-7 h-7 flex items-center justify-center rounded-lg
                      ${isSelected ? 'bg-white/20' : ''}
                    `}
                    style={{ backgroundColor: !isSelected ? `${habit.color}15` : undefined }}
                    >
                      {habit.emoji}
                    </span>
                    <span className="text-[14px] font-medium hidden sm:block">{habit.name}</span>
                    {count > 0 && (
                      <span className={`
                        absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5
                        flex items-center justify-center rounded-full
                        text-[10px] font-bold shadow-sm
                        ${isSelected
                          ? 'bg-white text-ios-text'
                          : 'bg-ios-gray-5 text-ios-gray-1'
                        }
                      `}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
})

export const TimeGrid = memo(function TimeGrid({
  isOpen,
  onClose,
  blocks,
  onUpdateBlocks,
  selectedHabit,
  onSelectHabit,
}: TimeGridProps) {
  const [localBlocks, setLocalBlocks] = useState<BlockAssignments>(() => [...blocks])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionStart, setSelectionStart] = useState<number | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Sync with props when opened
  useEffect(() => {
    if (isOpen) {
      setLocalBlocks([...blocks])
    }
  }, [isOpen, blocks])

  // Derive allocations from localBlocks for display
  const localAllocations = useMemo(
    () => blocksToAllocations(localBlocks),
    [localBlocks]
  )

  const getHabitById = useCallback((id: string | null) => {
    if (!id) return null
    return HABITS.find(h => h.id === id) || null
  }, [])

  const selectionRange = useMemo(() => {
    if (selectionStart === null) return new Set<number>()
    const end = selectionEnd ?? selectionStart
    const min = Math.min(selectionStart, end)
    const max = Math.max(selectionStart, end)
    return new Set(Array.from({ length: max - min + 1 }, (_, i) => min + i))
  }, [selectionStart, selectionEnd])

  const handlePointerDown = useCallback((index: number) => {
    setIsSelecting(true)
    setSelectionStart(index)
    setSelectionEnd(index)
  }, [])

  const handlePointerEnter = useCallback(
    (index: number) => {
      if (isSelecting) {
        setSelectionEnd(index)
      }
    },
    [isSelecting]
  )

  const applySelection = useCallback(() => {
    if (!isSelecting || selectionStart === null) {
      setIsSelecting(false)
      return
    }

    const end = selectionEnd ?? selectionStart
    const min = Math.min(selectionStart, end)
    const max = Math.max(selectionStart, end)

    // Update blocks at specific positions (THE FIX!)
    const newBlocks = [...localBlocks]
    for (let i = min; i <= max; i++) {
      newBlocks[i] = selectedHabit?.id ?? null
    }

    setLocalBlocks(newBlocks)
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }, [isSelecting, selectionStart, selectionEnd, selectedHabit, localBlocks])

  // Handle touch events for mobile
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isSelecting || !gridRef.current) return
      e.preventDefault()

      const touch = e.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      if (element) {
        const indexAttr = element.getAttribute('data-index')
        if (indexAttr !== null) {
          setSelectionEnd(parseInt(indexAttr, 10))
        }
      }
    },
    [isSelecting]
  )

  useEffect(() => {
    if (isSelecting) {
      const handleMouseUp = () => applySelection()
      const handleTouchEnd = () => applySelection()

      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)

      return () => {
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isSelecting, applySelection, handleTouchMove])

  const handleSave = useCallback(() => {
    onUpdateBlocks(localBlocks)
    onClose()
  }, [localBlocks, onUpdateBlocks, onClose])

  const handleCancel = useCallback(() => {
    setLocalBlocks([...blocks])
    onClose()
  }, [blocks, onClose])

  const usedBlocks = useMemo(() => countUsedBlocks(localBlocks), [localBlocks])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm"
      onClick={handleCancel}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl sm:mx-4 rounded-t-[24px] max-h-[94vh] flex flex-col animate-slide-up overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-ios-gray-4" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white/95 backdrop-blur-xl border-b border-ios-gray-5/50">
          <button
            onClick={handleCancel}
            className="text-ios-blue text-[17px] font-medium ios-press"
          >
            Cancel
          </button>
          <div className="text-center">
            <h2 className="text-[18px] font-semibold text-ios-text tracking-tight">Schedule</h2>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${usedBlocks > 0 ? 'bg-ios-green' : 'bg-ios-gray-3'}`} />
                <span className="text-[12px] text-ios-gray-1 font-medium tabular-nums">
                  {usedBlocks}/100
                </span>
              </div>
              <span className="text-ios-gray-4">·</span>
              <span className="text-[12px] text-ios-green font-medium">
                {blocksToTime(usedBlocks)}
              </span>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="text-ios-blue text-[17px] font-bold ios-press"
          >
            Done
          </button>
        </div>

        {/* Habit Palette */}
        <div className="px-5 py-4 bg-gradient-to-b from-white to-ios-gray-6/30 border-b border-ios-gray-5/50">
          <HabitPalette
            selectedHabit={selectedHabit}
            onSelect={onSelectHabit}
            allocations={localAllocations}
          />
          <p className="text-[12px] text-ios-gray-1 mt-3 text-center">
            {selectedHabit
              ? <>Tap or drag to paint <span className="font-semibold">{selectedHabit.emoji} {selectedHabit.name}</span></>
              : <>Tap or drag to clear blocks</>
            }
          </p>
        </div>

        {/* Time Grid - Vertical Timeline */}
        <div ref={gridRef} className="flex-1 overflow-y-auto bg-ios-gray-6/50 select-none">
          {HOUR_GROUPS.map((group, groupIdx) => (
            <div key={group.hour} className="flex bg-white border-b border-ios-gray-5/50">
              {/* Hour Label */}
              <div className="w-14 flex-shrink-0 relative">
                <div className="absolute -top-2 right-2 flex flex-col items-end">
                  <span className="text-[15px] font-semibold text-ios-text tabular-nums leading-none">
                    {group.label}
                  </span>
                  <span className="text-[9px] text-ios-gray-2 font-medium">
                    {group.ampm}
                  </span>
                </div>
                {/* Vertical line */}
                <div className="absolute top-0 right-0 w-px h-full bg-ios-gray-4/50" />
              </div>

              {/* 10-minute blocks for this hour */}
              <div className="flex-1 grid grid-cols-6">
                {group.slots.map((slot, slotIdx) => {
                  const habitId = localBlocks[slot.index]
                  const habit = getHabitById(habitId)
                  const isInSelection = selectionRange.has(slot.index)
                  const showPreview = isInSelection && selectedHabit && !habitId
                  const isHalfHour = slot.minute === 30

                  return (
                    <div
                      key={slot.index}
                      data-index={slot.index}
                      className={`
                        h-16 flex items-center justify-center cursor-pointer
                        transition-all duration-100 relative
                        ${slotIdx < 5 ? 'border-r border-ios-gray-5/30' : ''}
                        ${isHalfHour ? 'border-l-2 border-l-ios-gray-4/30' : ''}
                        ${isInSelection ? 'z-10' : ''}
                        ${!habit && !isInSelection ? 'hover:bg-ios-blue/5 active:bg-ios-blue/10' : ''}
                      `}
                      style={{
                        background: habit
                          ? `linear-gradient(180deg, ${habit.color}${isInSelection ? 'EE' : 'CC'} 0%, ${habit.color}${isInSelection ? 'DD' : 'AA'} 100%)`
                          : showPreview
                            ? `linear-gradient(180deg, ${selectedHabit.color}40 0%, ${selectedHabit.color}25 100%)`
                            : undefined,
                      }}
                      onMouseDown={() => handlePointerDown(slot.index)}
                      onMouseEnter={() => handlePointerEnter(slot.index)}
                      onTouchStart={() => handlePointerDown(slot.index)}
                    >
                      {/* Selection ring */}
                      {isInSelection && (
                        <div className="absolute inset-0 ring-2 ring-inset ring-ios-blue rounded-sm pointer-events-none" />
                      )}

                      {/* Habit emoji */}
                      {habit && (
                        <span className="text-xl drop-shadow-sm">{habit.emoji}</span>
                      )}

                      {/* Preview emoji */}
                      {showPreview && (
                        <span className="text-xl opacity-50">{selectedHabit.emoji}</span>
                      )}

                      {/* Time label on edges */}
                      {(slot.minute === 0 || slot.minute === 30) && !habit && !showPreview && (
                        <span className="absolute bottom-1 left-1 text-[9px] text-ios-gray-3 font-medium">
                          :{slot.minute.toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="px-5 py-4 bg-white border-t border-ios-gray-5/50">
          {usedBlocks > 0 ? (
            <>
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                {HABITS.filter(h => localAllocations[h.id] > 0).map(habit => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-ios-gray-6"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-inner"
                      style={{ background: `linear-gradient(135deg, ${habit.color} 0%, ${habit.color}CC 100%)` }}
                    />
                    <span className="text-[12px] font-medium text-ios-text">{habit.emoji}</span>
                    <span className="text-[12px] text-ios-gray-1 tabular-nums">
                      {blocksToTime(localAllocations[habit.id])}
                    </span>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-ios-gray-5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${usedBlocks}%`,
                    background: 'linear-gradient(90deg, #34C759 0%, #007AFF 50%, #5E5CE6 100%)',
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2 text-ios-gray-2">
              <span className="text-xl">🎯</span>
              <span className="text-[13px]">Select a habit and paint your day</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          60% { transform: translateY(-1%); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  )
})
