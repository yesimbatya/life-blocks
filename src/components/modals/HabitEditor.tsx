'use client'

import { useState, useCallback } from 'react'
import { CustomHabit, HabitCategory, HABIT_COLORS, CATEGORIES } from '@/lib/habits'

interface HabitEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (habit: CustomHabit) => void
  editHabit?: CustomHabit | null
}

export function HabitEditor({ isOpen, onClose, onSave, editHabit }: HabitEditorProps) {
  const [emoji, setEmoji] = useState(editHabit?.emoji || '')
  const [name, setName] = useState(editHabit?.name || '')
  const [baseReturn, setBaseReturn] = useState(editHabit?.baseReturn || 5.0)
  const [category, setCategory] = useState<HabitCategory>(editHabit?.category || 'growth')
  const [color, setColor] = useState(editHabit?.color || HABIT_COLORS[0])

  const isValid = emoji.trim().length > 0 && name.trim().length > 0

  const handleSave = useCallback(() => {
    if (!isValid) return

    const habit: CustomHabit = {
      id: editHabit?.id || crypto.randomUUID(),
      emoji: emoji.trim(),
      name: name.trim(),
      baseReturn,
      color,
      category,
      isCustom: true,
      createdAt: editHabit?.createdAt || new Date().toISOString(),
    }

    onSave(habit)
    onClose()
  }, [emoji, name, baseReturn, color, category, isValid, editHabit, onSave, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-ios-card w-full sm:max-w-md sm:rounded-2xl sm:mx-4 rounded-t-[24px] max-h-[85vh] flex flex-col animate-slide-up overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-ios-separator" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ios-separator">
          <button onClick={onClose} className="text-ios-blue text-[17px] font-medium ios-press">Cancel</button>
          <h2 className="text-[18px] font-semibold text-ios-text">{editHabit ? 'Edit Habit' : 'New Habit'}</h2>
          <button onClick={handleSave} disabled={!isValid} className="text-ios-blue text-[17px] font-bold ios-press disabled:opacity-40">Save</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Emoji */}
          <div>
            <label className="text-[13px] text-ios-text-secondary font-medium uppercase tracking-wide block mb-2">Emoji</label>
            <input
              type="text"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              placeholder="Pick an emoji..."
              maxLength={4}
              className="w-full bg-ios-bg rounded-ios px-4 py-3 text-[28px] text-center text-ios-text outline-none focus:ring-2 focus:ring-ios-blue"
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-[13px] text-ios-text-secondary font-medium uppercase tracking-wide block mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Habit name..."
              maxLength={20}
              className="w-full bg-ios-bg rounded-ios px-4 py-3 text-[17px] text-ios-text outline-none focus:ring-2 focus:ring-ios-blue placeholder:text-ios-text-secondary"
            />
          </div>

          {/* Base Return */}
          <div>
            <label className="text-[13px] text-ios-text-secondary font-medium uppercase tracking-wide block mb-2">
              Base Return: <span className={baseReturn >= 0 ? 'text-ios-green' : 'text-ios-red'}>{baseReturn >= 0 ? '+' : ''}{baseReturn.toFixed(1)}%</span>
            </label>
            <input
              type="range"
              min="-5"
              max="10"
              step="0.1"
              value={baseReturn}
              onChange={e => setBaseReturn(parseFloat(e.target.value))}
              className="w-full"
              style={{
                background: `linear-gradient(to right, #FF3B30 0%, #E5E5EA 33%, #34C759 100%)`,
              }}
            />
            <div className="flex justify-between text-[11px] text-ios-text-secondary mt-1">
              <span>-5%</span>
              <span>0%</span>
              <span>+10%</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-[13px] text-ios-text-secondary font-medium uppercase tracking-wide block mb-2">Category</label>
            <div className="flex gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`
                    flex-1 py-2.5 rounded-ios text-[14px] font-medium text-center transition-all ios-press
                    ${category === cat.key
                      ? 'bg-ios-blue text-white shadow-ios'
                      : 'bg-ios-bg text-ios-text'
                    }
                  `}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[13px] text-ios-text-secondary font-medium uppercase tracking-wide block mb-2">Color</label>
            <div className="flex flex-wrap gap-2.5">
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`
                    w-9 h-9 rounded-full transition-all ios-press
                    ${color === c ? 'ring-3 ring-ios-blue ring-offset-2 scale-110' : ''}
                  `}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          {isValid && (
            <div>
              <label className="text-[13px] text-ios-text-secondary font-medium uppercase tracking-wide block mb-2">Preview</label>
              <div className="bg-ios-bg rounded-ios p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${color}15` }}
                >
                  {emoji}
                </div>
                <div className="flex-1">
                  <div className="text-[17px] font-semibold text-ios-text">{name}</div>
                  <div className="text-[13px] text-ios-text-secondary">
                    {CATEGORIES.find(c => c.key === category)?.icon} {CATEGORIES.find(c => c.key === category)?.label}
                  </div>
                </div>
                <div className={`text-[17px] font-semibold ${baseReturn >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                  {baseReturn >= 0 ? '+' : ''}{baseReturn.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
