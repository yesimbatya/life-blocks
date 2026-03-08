import { DEFAULT_HABITS, Allocations, Habit, TOTAL_BLOCKS, BlockAssignments } from './habits'

/**
 * Calculate streak multiplier based on consecutive days
 * Formula: (1 + streak * 0.01)^(streak/7)
 * A 7-day streak roughly doubles returns
 */
export function calculateMultiplier(streak: number): number {
  if (streak < 1) return 1
  return Math.pow(1 + streak * 0.01, streak / 7)
}

/**
 * Calculate return for a single habit
 */
export function calculateHabitReturn(
  habit: Habit,
  blocks: number,
  multiplier: number
): number {
  if (blocks <= 0) return 0
  return habit.baseReturn * multiplier * blocks
}

/**
 * Calculate total portfolio return
 */
export function calculateTotalReturn(
  allocations: Allocations,
  streak: number,
  allHabits: readonly Habit[] = DEFAULT_HABITS
): number {
  const multiplier = calculateMultiplier(streak)
  return allHabits.reduce((sum, habit) => {
    const blocks = allocations[habit.id] || 0
    return sum + calculateHabitReturn(habit, blocks, multiplier)
  }, 0)
}

/**
 * Calculate used blocks from allocations
 */
export function calculateUsedBlocks(allocations: Allocations): number {
  return Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0)
}

/**
 * Calculate available blocks
 */
export function calculateAvailableBlocks(allocations: Allocations): number {
  return TOTAL_BLOCKS - calculateUsedBlocks(allocations)
}

/**
 * Convert blocks to human-readable time format
 * 1 block = 10 minutes, 6 blocks = 1 hour
 */
export function blocksToTime(blocks: number): string {
  if (blocks <= 0) return '0m'
  const hours = Math.floor(blocks / 6)
  const mins = (blocks % 6) * 10
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

/**
 * Validate allocation update
 * Returns true if the update is valid
 */
export function isValidAllocation(
  currentAllocations: Allocations,
  habitId: string,
  newValue: number,
  allHabits: readonly Habit[] = DEFAULT_HABITS
): boolean {
  if (newValue < 0) return false

  const habitExists = allHabits.some(h => h.id === habitId)
  if (!habitExists) return false

  const currentUsed = calculateUsedBlocks(currentAllocations)
  const currentHabitBlocks = currentAllocations[habitId] || 0
  const newTotal = currentUsed - currentHabitBlocks + newValue

  return newTotal <= TOTAL_BLOCKS
}

/**
 * Get today's date string in ISO format (YYYY-MM-DD)
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check if a date string is yesterday
 */
export function isYesterday(dateStr: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return dateStr === yesterday.toISOString().split('T')[0]
}

/**
 * Convert position-based blocks array to habit count allocations
 */
export function blocksToAllocations(blocks: BlockAssignments): Allocations {
  const allocations: Allocations = {}
  blocks.forEach(habitId => {
    if (habitId) {
      allocations[habitId] = (allocations[habitId] || 0) + 1
    }
  })
  return allocations
}

/**
 * Count used blocks from a BlockAssignments array
 */
export function countUsedBlocks(blocks: BlockAssignments): number {
  return blocks.filter(b => b !== null).length
}
