import { describe, it, expect } from 'vitest'
import { averageReturn, bestDay, longestStreak, habitConsistency, categoryDistribution, topHabits } from '../lib/analytics'
import { DayData, DEFAULT_HABITS, createEmptyBlocks } from '../lib/habits'

function makeDayData(overrides: Partial<DayData> & { date: string }): DayData {
  return {
    blocks: createEmptyBlocks(),
    streak: 1,
    totalReturn: 0,
    ...overrides,
  }
}

function makeBlocksWithHabit(habitId: string, count: number): (string | null)[] {
  const blocks = createEmptyBlocks()
  for (let i = 0; i < count; i++) blocks[i] = habitId
  return blocks
}

describe('averageReturn', () => {
  it('returns 0 for empty history', () => {
    expect(averageReturn([])).toBe(0)
  })

  it('calculates average correctly', () => {
    const history = [
      makeDayData({ date: '2025-01-01', totalReturn: 100 }),
      makeDayData({ date: '2025-01-02', totalReturn: 200 }),
      makeDayData({ date: '2025-01-03', totalReturn: 300 }),
    ]
    expect(averageReturn(history)).toBe(200)
  })

  it('respects day limit', () => {
    const history = [
      makeDayData({ date: '2025-01-01', totalReturn: 10 }),
      makeDayData({ date: '2025-01-02', totalReturn: 20 }),
      makeDayData({ date: '2025-01-03', totalReturn: 30 }),
    ]
    expect(averageReturn(history, 2)).toBe(25) // avg of last 2: (20+30)/2
  })
})

describe('bestDay', () => {
  it('returns null for empty history', () => {
    expect(bestDay([])).toBeNull()
  })

  it('finds the best day', () => {
    const history = [
      makeDayData({ date: '2025-01-01', totalReturn: 100 }),
      makeDayData({ date: '2025-01-02', totalReturn: 500 }),
      makeDayData({ date: '2025-01-03', totalReturn: 200 }),
    ]
    expect(bestDay(history)?.date).toBe('2025-01-02')
  })
})

describe('longestStreak', () => {
  it('returns 0 for empty history', () => {
    expect(longestStreak([])).toBe(0)
  })

  it('finds the max streak', () => {
    const history = [
      makeDayData({ date: '2025-01-01', streak: 3 }),
      makeDayData({ date: '2025-01-02', streak: 7 }),
      makeDayData({ date: '2025-01-03', streak: 2 }),
    ]
    expect(longestStreak(history)).toBe(7)
  })
})

describe('habitConsistency', () => {
  it('returns 0 for empty history', () => {
    expect(habitConsistency([], 'sleep')).toBe(0)
  })

  it('calculates percentage correctly', () => {
    const history = [
      makeDayData({ date: '2025-01-01', blocks: makeBlocksWithHabit('sleep', 10) }),
      makeDayData({ date: '2025-01-02', blocks: createEmptyBlocks() }),
      makeDayData({ date: '2025-01-03', blocks: makeBlocksWithHabit('sleep', 5) }),
      makeDayData({ date: '2025-01-04', blocks: createEmptyBlocks() }),
    ]
    expect(habitConsistency(history, 'sleep')).toBe(50) // 2 of 4 days
  })
})

describe('categoryDistribution', () => {
  it('returns zeros for empty history', () => {
    expect(categoryDistribution([], DEFAULT_HABITS)).toEqual({ essential: 0, growth: 0, drain: 0 })
  })

  it('calculates distribution correctly', () => {
    const blocks = createEmptyBlocks()
    // 5 blocks sleep (essential), 3 blocks deepwork (growth), 2 blocks scroll (drain)
    for (let i = 0; i < 5; i++) blocks[i] = 'sleep'
    for (let i = 5; i < 8; i++) blocks[i] = 'deepwork'
    for (let i = 8; i < 10; i++) blocks[i] = 'scroll'

    const history = [makeDayData({ date: '2025-01-01', blocks })]
    const dist = categoryDistribution(history, DEFAULT_HABITS)

    expect(dist.essential).toBeCloseTo(50) // 5/10
    expect(dist.growth).toBeCloseTo(30)    // 3/10
    expect(dist.drain).toBeCloseTo(20)     // 2/10
  })
})

describe('topHabits', () => {
  it('returns empty for empty history', () => {
    expect(topHabits([], DEFAULT_HABITS)).toEqual([])
  })

  it('ranks habits by total blocks', () => {
    const blocks = createEmptyBlocks()
    for (let i = 0; i < 20; i++) blocks[i] = 'sleep'
    for (let i = 20; i < 30; i++) blocks[i] = 'deepwork'

    const history = [makeDayData({ date: '2025-01-01', blocks })]
    const top = topHabits(history, DEFAULT_HABITS, 3)

    expect(top[0].habit.id).toBe('sleep')
    expect(top[0].totalBlocks).toBe(20)
    expect(top[1].habit.id).toBe('deepwork')
    expect(top[1].totalBlocks).toBe(10)
  })
})
