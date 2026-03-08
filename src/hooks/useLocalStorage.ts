'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DayData, TOTAL_BLOCKS, BlockAssignments, createEmptyBlocks, CustomHabit, UserSettings, DEFAULT_SETTINGS, DEFAULT_HABITS, mergeHabits } from '@/lib/habits'
import { getToday, isYesterday, blocksToAllocations, calculateTotalReturn } from '@/lib/calculations'

const STORAGE_KEY = 'life-blocks-data'
const SETTINGS_KEY = 'life-blocks-settings'
const MAX_HISTORY_DAYS = 30

interface StoredData {
  currentDate: string
  blocks: BlockAssignments
  streak: number
  history: DayData[]
}

const getDefaultData = (): StoredData => ({
  currentDate: getToday(),
  blocks: createEmptyBlocks(),
  streak: 1,
  history: [],
})

/**
 * Safely parse JSON from localStorage
 * Handles migration from old allocations format to new blocks format
 */
function parseStoredData(stored: string | null): StoredData | null {
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)

    // Validate basic structure
    if (
      typeof parsed !== 'object' ||
      typeof parsed.currentDate !== 'string' ||
      typeof parsed.streak !== 'number' ||
      !Array.isArray(parsed.history)
    ) {
      console.warn('Invalid stored data structure, resetting')
      return null
    }

    // Sanitize streak (must be positive integer)
    parsed.streak = Math.max(1, Math.floor(parsed.streak))

    // Handle migration from old allocations format to new blocks format
    if (Array.isArray(parsed.blocks)) {
      // New format - validate and sanitize blocks array
      const sanitizedBlocks: BlockAssignments = createEmptyBlocks()
      for (let i = 0; i < Math.min(parsed.blocks.length, TOTAL_BLOCKS); i++) {
        const val = parsed.blocks[i]
        if (typeof val === 'string' && val.length > 0) {
          sanitizedBlocks[i] = val
        }
      }
      parsed.blocks = sanitizedBlocks
    } else if (typeof parsed.allocations === 'object') {
      // Old format - migrate to new blocks format
      const blocks = createEmptyBlocks()
      let idx = 0
      for (const [habitId, count] of Object.entries(parsed.allocations)) {
        if (typeof count === 'number' && count > 0) {
          for (let i = 0; i < count && idx < TOTAL_BLOCKS; i++) {
            blocks[idx++] = habitId
          }
        }
      }
      parsed.blocks = blocks
      delete parsed.allocations
    } else {
      // No valid data, start fresh
      parsed.blocks = createEmptyBlocks()
    }

    return parsed as StoredData
  } catch (e) {
    console.error('Failed to parse stored data:', e)
    return null
  }
}

/**
 * Parse settings from localStorage
 */
function parseSettings(stored: string | null): UserSettings {
  if (!stored) return { ...DEFAULT_SETTINGS }

  try {
    const parsed = JSON.parse(stored)
    return {
      theme: ['light', 'dark', 'system'].includes(parsed.theme) ? parsed.theme : 'system',
      customHabits: Array.isArray(parsed.customHabits) ? parsed.customHabits.filter(
        (h: unknown) =>
          typeof h === 'object' && h !== null &&
          typeof (h as CustomHabit).id === 'string' &&
          typeof (h as CustomHabit).name === 'string' &&
          typeof (h as CustomHabit).emoji === 'string'
      ) : [],
      onboardingComplete: typeof parsed.onboardingComplete === 'boolean' ? parsed.onboardingComplete : false,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

/**
 * Process data for a new day - save history and reset blocks
 */
function processNewDay(parsed: StoredData, today: string, allHabits: readonly import('@/lib/habits').Habit[]): StoredData {
  const allocations = blocksToAllocations(parsed.blocks)
  const yesterdayReturn = calculateTotalReturn(allocations, parsed.streak, allHabits)

  const yesterdayData: DayData = {
    date: parsed.currentDate,
    blocks: [...parsed.blocks],
    streak: parsed.streak,
    totalReturn: yesterdayReturn,
  }

  const isConsecutive = isYesterday(parsed.currentDate)

  return {
    currentDate: today,
    blocks: createEmptyBlocks(),
    streak: isConsecutive ? parsed.streak + 1 : 1,
    history: [...parsed.history, yesterdayData].slice(-MAX_HISTORY_DAYS),
  }
}

export function useLocalStorage() {
  const [data, setData] = useState<StoredData>(getDefaultData)
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS })
  const [isLoaded, setIsLoaded] = useState(false)
  const [previousStreak, setPreviousStreak] = useState<number | null>(null)

  // Merge default habits with custom habits
  const allHabits = useMemo(
    () => mergeHabits(settings.customHabits),
    [settings.customHabits]
  )

  // Derive allocations from blocks for components that need counts
  const allocations = useMemo(
    () => blocksToAllocations(data.blocks),
    [data.blocks]
  )

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY)
      const loadedSettings = parseSettings(storedSettings)
      setSettings(loadedSettings)

      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = parseStoredData(stored)

      if (parsed) {
        const today = getToday()
        const habits = mergeHabits(loadedSettings.customHabits)

        if (parsed.currentDate !== today) {
          // Track the old streak before day rollover
          setPreviousStreak(parsed.streak)
          setData(processNewDay(parsed, today, habits))
        } else {
          setData(parsed)
        }
      }
    } catch (e) {
      console.error('localStorage access failed:', e)
    }

    setIsLoaded(true)
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }, [data, isLoaded])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }, [settings, isLoaded])

  const updateBlocks = useCallback((blocks: BlockAssignments) => {
    if (blocks.length !== TOTAL_BLOCKS) {
      console.warn('Invalid blocks array length, ignoring update')
      return
    }

    setData(prev => ({ ...prev, blocks: [...blocks] }))
  }, [])

  const resetToday = useCallback(() => {
    setData(prev => ({ ...prev, blocks: createEmptyBlocks() }))
  }, [])

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const addCustomHabit = useCallback((habit: CustomHabit) => {
    setSettings(prev => ({
      ...prev,
      customHabits: [...prev.customHabits, habit],
    }))
  }, [])

  const removeCustomHabit = useCallback((habitId: string) => {
    setSettings(prev => ({
      ...prev,
      customHabits: prev.customHabits.filter(h => h.id !== habitId),
    }))
    // Also remove any blocks assigned to this habit
    setData(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b === habitId ? null : b),
    }))
  }, [])

  const editCustomHabit = useCallback((habitId: string, updates: Partial<Omit<CustomHabit, 'id' | 'isCustom' | 'createdAt'>>) => {
    setSettings(prev => ({
      ...prev,
      customHabits: prev.customHabits.map(h =>
        h.id === habitId ? { ...h, ...updates } : h
      ),
    }))
  }, [])

  return {
    blocks: data.blocks,
    allocations,
    streak: data.streak,
    previousStreak,
    history: data.history,
    isLoaded,
    updateBlocks,
    resetToday,
    settings,
    updateSettings,
    allHabits,
    addCustomHabit,
    removeCustomHabit,
    editCustomHabit,
  }
}
