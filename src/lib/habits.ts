/** Habit categories for grouping and display */
export type HabitCategory = 'essential' | 'growth' | 'drain'

/** Habit ID type - matches the id field in HABITS array */
export type HabitId =
  | 'sleep'
  | 'deepwork'
  | 'exercise'
  | 'reading'
  | 'meditate'
  | 'japanese'
  | 'build'
  | 'connect'
  | 'scroll'
  | 'netflix'

/** Habit definition */
export interface Habit {
  readonly id: HabitId
  readonly emoji: string
  readonly name: string
  readonly baseReturn: number
  readonly color: string
  readonly category: HabitCategory
}

/** Predefined habits with their return rates */
export const HABITS: readonly Habit[] = [
  { id: 'sleep', emoji: '😴', name: 'Sleep', baseReturn: 8.2, color: '#5E5CE6', category: 'essential' },
  { id: 'deepwork', emoji: '🎯', name: 'Deep Work', baseReturn: 7.5, color: '#32ADE6', category: 'growth' },
  { id: 'exercise', emoji: '🏃', name: 'Exercise', baseReturn: 6.8, color: '#FF9F0A', category: 'essential' },
  { id: 'reading', emoji: '📚', name: 'Reading', baseReturn: 4.8, color: '#BF5AF2', category: 'growth' },
  { id: 'meditate', emoji: '🧘', name: 'Meditate', baseReturn: 5.2, color: '#64D2FF', category: 'growth' },
  { id: 'japanese', emoji: '🇯🇵', name: 'Japanese', baseReturn: 4.2, color: '#FF375F', category: 'growth' },
  { id: 'build', emoji: '⚡', name: 'Build', baseReturn: 6.1, color: '#30D158', category: 'growth' },
  { id: 'connect', emoji: '💬', name: 'Connect', baseReturn: 5.5, color: '#FF6482', category: 'essential' },
  { id: 'scroll', emoji: '📱', name: 'Scrolling', baseReturn: -2.1, color: '#8E8E93', category: 'drain' },
  { id: 'netflix', emoji: '📺', name: 'Binge', baseReturn: -1.5, color: '#636366', category: 'drain' },
] as const

/** Total blocks available per day (100 x 10-min blocks = 1000 waking minutes) */
export const TOTAL_BLOCKS = 100 as const

/** Map of habit ID to number of blocks allocated (derived from BlockAssignments) */
export interface Allocations {
  [habitId: string]: number
}

/** Position-based block assignments - array of 100 slots, each containing a habit ID or null */
export type BlockAssignments = (string | null)[]

/** Create empty block assignments */
export function createEmptyBlocks(): BlockAssignments {
  return new Array(TOTAL_BLOCKS).fill(null)
}

/** Historical record for a single day */
export interface DayData {
  readonly date: string
  readonly blocks: BlockAssignments
  readonly streak: number
  readonly totalReturn: number
}

/** Helper to get habit by ID with type safety */
export function getHabitById(id: string): Habit | undefined {
  return HABITS.find(h => h.id === id)
}

/** Get all habits in a category */
export function getHabitsByCategory(category: HabitCategory): readonly Habit[] {
  return HABITS.filter(h => h.category === category)
}

/** Category metadata for display */
export const CATEGORIES: readonly { key: HabitCategory; label: string; icon: string }[] = [
  { key: 'essential', label: 'Blue Chips', icon: '💎' },
  { key: 'growth', label: 'Growth', icon: '📈' },
  { key: 'drain', label: 'Energy Drains', icon: '⚠️' },
] as const
