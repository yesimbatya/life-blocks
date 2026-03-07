import { describe, it, expect } from 'vitest'
import {
  calculateMultiplier,
  calculateHabitReturn,
  calculateTotalReturn,
  calculateUsedBlocks,
  calculateAvailableBlocks,
  blocksToTime,
  isValidAllocation,
  isYesterday,
} from '../lib/calculations'
import { HABITS, TOTAL_BLOCKS } from '../lib/habits'

describe('calculateMultiplier', () => {
  it('returns 1 for streak of 0 or less', () => {
    expect(calculateMultiplier(0)).toBe(1)
    expect(calculateMultiplier(-1)).toBe(1)
  })

  it('returns correct multiplier for streak of 1', () => {
    const expected = Math.pow(1.01, 1 / 7)
    expect(calculateMultiplier(1)).toBeCloseTo(expected, 10)
  })

  it('returns expected value at 7-day streak', () => {
    // Formula: (1 + 7 * 0.01)^(7/7) = 1.07^1 = 1.07
    const multiplier = calculateMultiplier(7)
    expect(multiplier).toBeCloseTo(1.07, 5)
  })

  it('increases exponentially with longer streaks', () => {
    const day7 = calculateMultiplier(7)
    const day14 = calculateMultiplier(14)
    const day30 = calculateMultiplier(30)

    expect(day14).toBeGreaterThan(day7)
    expect(day30).toBeGreaterThan(day14)
  })
})

describe('calculateHabitReturn', () => {
  const sleepHabit = HABITS.find(h => h.id === 'sleep')!

  it('returns 0 for 0 or negative blocks', () => {
    expect(calculateHabitReturn(sleepHabit, 0, 1)).toBe(0)
    expect(calculateHabitReturn(sleepHabit, -1, 1)).toBe(0)
  })

  it('calculates correctly with multiplier of 1', () => {
    const result = calculateHabitReturn(sleepHabit, 10, 1)
    expect(result).toBeCloseTo(sleepHabit.baseReturn * 10, 10)
  })

  it('applies multiplier correctly', () => {
    const result = calculateHabitReturn(sleepHabit, 10, 2)
    expect(result).toBeCloseTo(sleepHabit.baseReturn * 20, 10)
  })
})

describe('calculateTotalReturn', () => {
  it('returns 0 for empty allocations', () => {
    expect(calculateTotalReturn({}, 1)).toBe(0)
  })

  it('calculates total for multiple habits', () => {
    const allocations = { sleep: 10, deepwork: 5 }
    const result = calculateTotalReturn(allocations, 1)

    const multiplier = calculateMultiplier(1)
    const sleepReturn = 8.2 * multiplier * 10
    const deepworkReturn = 7.5 * multiplier * 5

    expect(result).toBeCloseTo(sleepReturn + deepworkReturn, 5)
  })

  it('handles negative return habits (drains)', () => {
    const allocations = { scroll: 10 }
    const result = calculateTotalReturn(allocations, 1)
    expect(result).toBeLessThan(0)
  })
})

describe('calculateUsedBlocks', () => {
  it('returns 0 for empty allocations', () => {
    expect(calculateUsedBlocks({})).toBe(0)
  })

  it('sums all allocations', () => {
    expect(calculateUsedBlocks({ sleep: 10, deepwork: 5 })).toBe(15)
  })

  it('handles undefined values gracefully', () => {
    const allocations = { sleep: 10, deepwork: undefined as unknown as number }
    expect(calculateUsedBlocks(allocations)).toBe(10)
  })
})

describe('calculateAvailableBlocks', () => {
  it('returns TOTAL_BLOCKS for empty allocations', () => {
    expect(calculateAvailableBlocks({})).toBe(TOTAL_BLOCKS)
  })

  it('returns correct remaining blocks', () => {
    expect(calculateAvailableBlocks({ sleep: 30 })).toBe(70)
  })
})

describe('blocksToTime', () => {
  it('returns 0m for 0 or negative blocks', () => {
    expect(blocksToTime(0)).toBe('0m')
    expect(blocksToTime(-1)).toBe('0m')
  })

  it('returns minutes only when less than 1 hour', () => {
    expect(blocksToTime(1)).toBe('10m')
    expect(blocksToTime(3)).toBe('30m')
    expect(blocksToTime(5)).toBe('50m')
  })

  it('returns hours only when exact hours', () => {
    expect(blocksToTime(6)).toBe('1h')
    expect(blocksToTime(12)).toBe('2h')
  })

  it('returns hours and minutes for mixed', () => {
    expect(blocksToTime(7)).toBe('1h 10m')
    expect(blocksToTime(15)).toBe('2h 30m')
  })
})

describe('isValidAllocation', () => {
  it('rejects negative values', () => {
    expect(isValidAllocation({}, 'sleep', -1)).toBe(false)
  })

  it('rejects invalid habit ids', () => {
    expect(isValidAllocation({}, 'invalid-habit', 10)).toBe(false)
  })

  it('allows valid allocations within total', () => {
    expect(isValidAllocation({}, 'sleep', 50)).toBe(true)
    expect(isValidAllocation({ sleep: 30 }, 'deepwork', 50)).toBe(true)
  })

  it('rejects allocations exceeding total', () => {
    expect(isValidAllocation({ sleep: 50 }, 'deepwork', 60)).toBe(false)
  })

  it('allows updating existing allocation', () => {
    expect(isValidAllocation({ sleep: 50 }, 'sleep', 100)).toBe(true)
  })
})

describe('isYesterday', () => {
  it('returns true for yesterday date', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    expect(isYesterday(yesterdayStr)).toBe(true)
  })

  it('returns false for today', () => {
    const today = new Date().toISOString().split('T')[0]
    expect(isYesterday(today)).toBe(false)
  })

  it('returns false for older dates', () => {
    const oldDate = new Date()
    oldDate.setDate(oldDate.getDate() - 5)
    const oldDateStr = oldDate.toISOString().split('T')[0]
    expect(isYesterday(oldDateStr)).toBe(false)
  })
})
