import { describe, it, expect } from 'vitest'
import { exportData, importData } from '../lib/export'
import { createEmptyBlocks, DEFAULT_SETTINGS } from '../lib/habits'

describe('exportData', () => {
  it('creates valid JSON with version 2', () => {
    const data = {
      blocks: createEmptyBlocks(),
      streak: 5,
      history: [],
    }
    const json = exportData(data, DEFAULT_SETTINGS)
    const parsed = JSON.parse(json)

    expect(parsed.version).toBe(2)
    expect(parsed.exportDate).toBeDefined()
    expect(parsed.data.streak).toBe(5)
    expect(parsed.data.blocks).toHaveLength(100)
    expect(parsed.settings.theme).toBe('system')
  })
})

describe('importData', () => {
  it('returns null for invalid JSON', () => {
    expect(importData('not json')).toBeNull()
  })

  it('returns null for missing fields', () => {
    expect(importData(JSON.stringify({ version: 2 }))).toBeNull()
  })

  it('round-trips with exportData', () => {
    const data = {
      blocks: createEmptyBlocks(),
      streak: 3,
      history: [],
    }
    const json = exportData(data, DEFAULT_SETTINGS)
    const imported = importData(json)

    expect(imported).not.toBeNull()
    expect(imported!.data.streak).toBe(3)
    expect(imported!.settings.theme).toBe('system')
    expect(imported!.data.blocks).toHaveLength(100)
  })

  it('parses blocks with habit IDs', () => {
    const blocks = createEmptyBlocks()
    blocks[0] = 'sleep'
    blocks[1] = 'deepwork'

    const json = exportData({ blocks, streak: 1, history: [] }, DEFAULT_SETTINGS)
    const imported = importData(json)

    expect(imported!.data.blocks[0]).toBe('sleep')
    expect(imported!.data.blocks[1]).toBe('deepwork')
    expect(imported!.data.blocks[2]).toBeNull()
  })
})
