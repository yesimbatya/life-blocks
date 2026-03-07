'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DayData, TOTAL_BLOCKS, BlockAssignments, createEmptyBlocks } from '@/lib/habits'
import { getToday, isYesterday, blocksToAllocations, calculateTotalReturn } from '@/lib/calculations'

const STORAGE_KEY = 'life-blocks-data'
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
      // Note: This will place habits sequentially (best effort migration)
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
 * Process data for a new day - save history and reset blocks
 */
function processNewDay(parsed: StoredData, today: string): StoredData {
  // Calculate the total return for yesterday before saving to history
  const allocations = blocksToAllocations(parsed.blocks)
  const yesterdayReturn = calculateTotalReturn(allocations, parsed.streak)

  const yesterdayData: DayData = {
    date: parsed.currentDate,
    blocks: [...parsed.blocks],
    streak: parsed.streak,
    totalReturn: yesterdayReturn,
  }

  // Check if streak continues (was yesterday)
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
  const [isLoaded, setIsLoaded] = useState(false)

  // Derive allocations from blocks for components that need counts
  const allocations = useMemo(
    () => blocksToAllocations(data.blocks),
    [data.blocks]
  )

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = parseStoredData(stored)

      if (parsed) {
        const today = getToday()

        if (parsed.currentDate !== today) {
          setData(processNewDay(parsed, today))
        } else {
          setData(parsed)
        }
      }
    } catch (e) {
      // localStorage might not be available (SSR, private browsing, etc.)
      console.error('localStorage access failed:', e)
    }

    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoaded) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      // localStorage might be full or unavailable
      console.error('Failed to save to localStorage:', e)
    }
  }, [data, isLoaded])

  const updateBlocks = useCallback((blocks: BlockAssignments) => {
    // Validate blocks array length
    if (blocks.length !== TOTAL_BLOCKS) {
      console.warn('Invalid blocks array length, ignoring update')
      return
    }

    setData(prev => ({ ...prev, blocks: [...blocks] }))
  }, [])

  const resetToday = useCallback(() => {
    setData(prev => ({ ...prev, blocks: createEmptyBlocks() }))
  }, [])

  return {
    blocks: data.blocks,
    allocations, // Derived from blocks for backward compatibility
    streak: data.streak,
    history: data.history,
    isLoaded,
    updateBlocks,
    resetToday,
  }
}
