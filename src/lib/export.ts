import { BlockAssignments, DayData, UserSettings } from './habits'

interface ExportData {
  version: 2
  exportDate: string
  data: {
    currentDate: string
    blocks: BlockAssignments
    streak: number
    history: DayData[]
  }
  settings: UserSettings
}

/** Export all app data as a JSON string */
export function exportData(
  data: { currentDate?: string; blocks: BlockAssignments; streak: number; history: DayData[] },
  settings: UserSettings
): string {
  const exportPayload: ExportData = {
    version: 2,
    exportDate: new Date().toISOString(),
    data: {
      currentDate: data.currentDate || new Date().toISOString().split('T')[0],
      blocks: data.blocks,
      streak: data.streak,
      history: data.history,
    },
    settings,
  }
  return JSON.stringify(exportPayload, null, 2)
}

/** Parse and validate imported JSON data */
export function importData(json: string): ExportData | null {
  try {
    const parsed = JSON.parse(json)

    if (typeof parsed !== 'object' || parsed === null) return null

    // Validate required fields
    if (!parsed.data || !parsed.settings) return null
    if (!Array.isArray(parsed.data.blocks)) return null
    if (!Array.isArray(parsed.data.history)) return null
    if (typeof parsed.data.streak !== 'number') return null

    return parsed as ExportData
  } catch {
    return null
  }
}

/** Trigger a file download in the browser */
export function downloadJson(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
