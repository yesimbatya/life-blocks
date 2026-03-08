import { DayData, Habit } from './habits'
import { blocksToAllocations } from './calculations'

/** Calculate average return over the last N days */
export function averageReturn(history: DayData[], days?: number): number {
  const slice = days ? history.slice(-days) : history
  if (slice.length === 0) return 0
  return slice.reduce((sum, d) => sum + d.totalReturn, 0) / slice.length
}

/** Find the best performing day */
export function bestDay(history: DayData[]): DayData | null {
  if (history.length === 0) return null
  return history.reduce((best, d) => d.totalReturn > best.totalReturn ? d : best)
}

/** Find the longest streak in history */
export function longestStreak(history: DayData[]): number {
  if (history.length === 0) return 0
  return Math.max(...history.map(d => d.streak))
}

/** Calculate what percentage of days a habit was used */
export function habitConsistency(history: DayData[], habitId: string): number {
  if (history.length === 0) return 0
  const daysUsed = history.filter(d => {
    const allocs = blocksToAllocations(d.blocks)
    return (allocs[habitId] || 0) > 0
  }).length
  return (daysUsed / history.length) * 100
}

/** Get category distribution as percentages */
export function categoryDistribution(
  history: DayData[],
  allHabits: readonly Habit[]
): { essential: number; growth: number; drain: number } {
  if (history.length === 0) return { essential: 0, growth: 0, drain: 0 }

  let totalBlocks = 0
  const categoryBlocks = { essential: 0, growth: 0, drain: 0 }

  history.forEach(day => {
    const allocs = blocksToAllocations(day.blocks)
    Object.entries(allocs).forEach(([habitId, count]) => {
      const habit = allHabits.find(h => h.id === habitId)
      if (habit) {
        categoryBlocks[habit.category] += count
        totalBlocks += count
      }
    })
  })

  if (totalBlocks === 0) return { essential: 0, growth: 0, drain: 0 }

  return {
    essential: (categoryBlocks.essential / totalBlocks) * 100,
    growth: (categoryBlocks.growth / totalBlocks) * 100,
    drain: (categoryBlocks.drain / totalBlocks) * 100,
  }
}

/** Get daily returns */
export function dailyReturnsData(history: DayData[]): { date: string; totalReturn: number }[] {
  return history.map(d => ({
    date: d.date,
    totalReturn: d.totalReturn,
  }))
}

/** Get the top habits by time spent across history */
export function topHabits(
  history: DayData[],
  allHabits: readonly Habit[],
  limit = 5
): { habit: Habit; totalBlocks: number; avgBlocks: number }[] {
  if (history.length === 0) return []

  const habitTotals: Record<string, number> = {}

  history.forEach(day => {
    const allocs = blocksToAllocations(day.blocks)
    Object.entries(allocs).forEach(([habitId, count]) => {
      habitTotals[habitId] = (habitTotals[habitId] || 0) + count
    })
  })

  return Object.entries(habitTotals)
    .map(([habitId, total]) => {
      const habit = allHabits.find(h => h.id === habitId)
      if (!habit) return null
      return { habit, totalBlocks: total, avgBlocks: total / history.length }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.totalBlocks - a.totalBlocks)
    .slice(0, limit)
}
