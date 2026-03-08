'use client'

import { useState, useCallback, useRef } from 'react'
import { UserSettings, Habit, CustomHabit, DEFAULT_HABITS, CATEGORIES, BlockAssignments, DayData } from '@/lib/habits'
import { exportData, importData, downloadJson } from '@/lib/export'
import { HabitEditor } from '@/components/modals/HabitEditor'

interface SettingsViewProps {
  settings: UserSettings
  onUpdateSettings: (updates: Partial<UserSettings>) => void
  allHabits: readonly Habit[]
  onAddCustomHabit: (habit: CustomHabit) => void
  onRemoveCustomHabit: (habitId: string) => void
  onEditCustomHabit: (habitId: string, updates: Partial<Omit<CustomHabit, 'id' | 'isCustom' | 'createdAt'>>) => void
  blocks: BlockAssignments
  history: DayData[]
}

export function SettingsView({
  settings,
  onUpdateSettings,
  allHabits,
  onAddCustomHabit,
  onRemoveCustomHabit,
  onEditCustomHabit,
  blocks,
  history,
}: SettingsViewProps) {
  const [showHabitEditor, setShowHabitEditor] = useState(false)
  const [editingHabit, setEditingHabit] = useState<CustomHabit | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = useCallback(() => {
    const data = { blocks, streak: 1, history }
    const json = exportData(data, settings)
    const date = new Date().toISOString().split('T')[0]
    downloadJson(json, `life-blocks-export-${date}.json`)
  }, [blocks, history, settings])

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const json = event.target?.result as string
      const parsed = importData(json)

      if (parsed) {
        // Apply imported settings
        onUpdateSettings(parsed.settings)
        // Apply imported data via localStorage directly
        try {
          localStorage.setItem('life-blocks-data', JSON.stringify(parsed.data))
          localStorage.setItem('life-blocks-settings', JSON.stringify(parsed.settings))
          setImportStatus('Import successful! Reloading...')
          setTimeout(() => window.location.reload(), 1000)
        } catch {
          setImportStatus('Failed to save imported data')
        }
      } else {
        setImportStatus('Invalid file format')
      }
    }
    reader.readAsText(file)

    // Reset input
    e.target.value = ''
  }, [onUpdateSettings])

  const handleReset = useCallback(() => {
    localStorage.removeItem('life-blocks-data')
    localStorage.removeItem('life-blocks-settings')
    window.location.reload()
  }, [])

  const handleAddHabit = useCallback((habit: CustomHabit) => {
    onAddCustomHabit(habit)
  }, [onAddCustomHabit])

  const handleEditHabit = useCallback((habit: CustomHabit) => {
    setEditingHabit(habit)
    setShowHabitEditor(true)
  }, [])

  const handleSaveEdit = useCallback((habit: CustomHabit) => {
    if (editingHabit) {
      onEditCustomHabit(editingHabit.id, {
        emoji: habit.emoji,
        name: habit.name,
        baseReturn: habit.baseReturn,
        category: habit.category,
        color: habit.color,
      })
    } else {
      onAddCustomHabit(habit)
    }
    setEditingHabit(null)
  }, [editingHabit, onEditCustomHabit, onAddCustomHabit])

  return (
    <div className="pb-24 pt-12">
      {/* Header */}
      <div className="px-5 mb-6">
        <h1 className="text-[34px] font-bold text-ios-text tracking-tight">Settings</h1>
      </div>

      {/* Appearance */}
      <div className="px-5 mb-6">
        <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
          Appearance
        </div>
        <div className="bg-ios-card rounded-ios-lg overflow-hidden shadow-ios p-4">
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map(theme => (
              <button
                key={theme}
                onClick={() => onUpdateSettings({ theme })}
                className={`
                  flex-1 py-2.5 rounded-ios text-[14px] font-medium text-center transition-all ios-press
                  ${settings.theme === theme
                    ? 'bg-ios-blue text-white shadow-ios'
                    : 'bg-ios-bg text-ios-text'
                  }
                `}
              >
                {theme === 'light' && '☀️ Light'}
                {theme === 'dark' && '🌙 Dark'}
                {theme === 'system' && '⚙️ System'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Habits */}
      <div className="px-5 mb-6">
        <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
          Habits
        </div>
        <div className="bg-ios-card rounded-ios-lg overflow-hidden shadow-ios">
          {/* Default habits */}
          {CATEGORIES.map(cat => {
            const habits = allHabits.filter(h => h.category === cat.key)
            if (habits.length === 0) return null

            return habits.map((habit, idx) => {
              const isCustom = 'isCustom' in habit && habit.isCustom
              const isLast = idx === habits.length - 1 && cat === CATEGORIES[CATEGORIES.length - 1]

              return (
                <div key={habit.id} className={`flex items-center px-4 py-3 ${!isLast ? 'border-b border-ios-separator' : ''}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3"
                    style={{ backgroundColor: `${habit.color}15` }}
                  >
                    {habit.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-medium text-ios-text">{habit.name}</div>
                    <div className="text-[12px] text-ios-text-secondary">
                      {habit.baseReturn >= 0 ? '+' : ''}{habit.baseReturn}% · {CATEGORIES.find(c => c.key === habit.category)?.label}
                      {isCustom && ' · Custom'}
                    </div>
                  </div>
                  {isCustom && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditHabit(habit as CustomHabit)}
                        className="text-ios-blue text-[14px] ios-press"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onRemoveCustomHabit(habit.id)}
                        className="text-ios-red text-[14px] ios-press"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          })}

          {/* Add habit button */}
          <button
            onClick={() => { setEditingHabit(null); setShowHabitEditor(true) }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border-t border-ios-separator text-ios-blue font-medium text-[15px] ios-press"
          >
            <span className="text-lg">+</span>
            <span>Add Custom Habit</span>
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="px-5 mb-6">
        <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
          Data
        </div>
        <div className="bg-ios-card rounded-ios-lg overflow-hidden shadow-ios">
          <button onClick={handleExport} className="w-full flex items-center px-4 py-3.5 border-b border-ios-separator ios-press">
            <span className="text-lg mr-3">📤</span>
            <span className="text-[15px] text-ios-text font-medium">Export Data</span>
          </button>
          <button onClick={handleImportClick} className="w-full flex items-center px-4 py-3.5 border-b border-ios-separator ios-press">
            <span className="text-lg mr-3">📥</span>
            <span className="text-[15px] text-ios-text font-medium">Import Data</span>
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center px-4 py-3.5 ios-press"
          >
            <span className="text-lg mr-3">🗑️</span>
            <span className="text-[15px] text-ios-red font-medium">Reset All Data</span>
          </button>
        </div>

        {importStatus && (
          <div className="mt-3 px-4 py-3 rounded-ios bg-ios-bg text-[14px] text-ios-text-secondary text-center">
            {importStatus}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* About */}
      <div className="px-5 mb-6">
        <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
          About
        </div>
        <div className="bg-ios-card rounded-ios-lg p-4 shadow-ios">
          <div className="text-[17px] font-semibold text-ios-text mb-1">Life Blocks</div>
          <div className="text-[14px] text-ios-text-secondary leading-relaxed">
            Invest your time like a portfolio. 100 blocks. Make them count.
          </div>
          <div className="text-[12px] text-ios-text-secondary mt-2">Version 2.0</div>
        </div>
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-ios-card rounded-ios-xl mx-8 p-6 shadow-2xl max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <span className="text-4xl mb-3 block">⚠️</span>
              <h3 className="text-[17px] font-semibold text-ios-text mb-2">Reset All Data?</h3>
              <p className="text-[14px] text-ios-text-secondary">This will delete all your history, custom habits, and settings. This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-ios bg-ios-bg text-ios-text font-medium text-[15px] ios-press"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-ios bg-ios-red text-white font-medium text-[15px] ios-press"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habit Editor Modal */}
      <HabitEditor
        isOpen={showHabitEditor}
        onClose={() => { setShowHabitEditor(false); setEditingHabit(null) }}
        onSave={handleSaveEdit}
        editHabit={editingHabit}
      />
    </div>
  )
}
