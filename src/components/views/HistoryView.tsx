'use client'

import { useState, useMemo } from 'react'
import { DayData, Habit, DEFAULT_HABITS } from '@/lib/habits'
import { blocksToAllocations, blocksToTime, calculateHabitReturn, calculateMultiplier } from '@/lib/calculations'
import { averageReturn, bestDay, longestStreak, categoryDistribution, dailyReturnsData, topHabits } from '@/lib/analytics'
import { WeeklyChart } from '@/components/charts/WeeklyChart'
import { CategoryBreakdown } from '@/components/charts/CategoryBreakdown'

interface HistoryViewProps {
  history: DayData[]
  streak: number
  allHabits?: readonly Habit[]
}

export function HistoryView({ history, streak, allHabits = DEFAULT_HABITS }: HistoryViewProps) {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)

  const weeklyAvg = useMemo(() => averageReturn(history, 7), [history])
  const monthlyAvg = useMemo(() => averageReturn(history), [history])
  const best = useMemo(() => bestDay(history), [history])
  const longest = useMemo(() => longestStreak(history), [history])
  const catDist = useMemo(() => categoryDistribution(history, allHabits), [history, allHabits])
  const dailyReturns = useMemo(() => dailyReturnsData(history), [history])
  const topHabitsList = useMemo(() => topHabits(history, allHabits, 5), [history, allHabits])

  // Calendar heat map data
  const calendarDays = useMemo(() => {
    const days: { date: string; data: DayData | null; dayOfWeek: number }[] = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayData = history.find(h => h.date === dateStr) || null

      days.push({
        date: dateStr,
        data: dayData,
        dayOfWeek: d.getDay(),
      })
    }

    return days
  }, [history])

  const isEmpty = history.length === 0

  return (
    <div className="pb-24">
      <div className="h-12" />

      {/* Header */}
      <div className="px-5 mb-6">
        <h1 className="text-[34px] font-bold text-ios-text tracking-tight mb-1">History</h1>
        <p className="text-[15px] text-ios-text-secondary">
          {history.length > 0 ? `${history.length} days tracked` : 'Start tracking to see your progress'}
        </p>
      </div>

      {isEmpty ? (
        <div className="px-5">
          <div className="bg-ios-card rounded-ios-xl p-8 shadow-ios flex flex-col items-center text-center">
            <span className="text-5xl mb-4">📈</span>
            <p className="text-[20px] font-semibold text-ios-text mb-2">No history yet</p>
            <p className="text-[15px] text-ios-text-secondary leading-relaxed">
              Complete your first day of scheduling to start seeing trends and analytics here.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="px-5 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-ios-card rounded-ios-lg p-4 shadow-ios">
                <div className="text-[12px] text-ios-text-secondary font-medium uppercase tracking-wide mb-1">7-Day Avg</div>
                <div className={`text-[24px] font-bold ${weeklyAvg >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                  {weeklyAvg >= 0 ? '+' : ''}{weeklyAvg.toFixed(0)}%
                </div>
              </div>
              <div className="bg-ios-card rounded-ios-lg p-4 shadow-ios">
                <div className="text-[12px] text-ios-text-secondary font-medium uppercase tracking-wide mb-1">All-Time Avg</div>
                <div className={`text-[24px] font-bold ${monthlyAvg >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                  {monthlyAvg >= 0 ? '+' : ''}{monthlyAvg.toFixed(0)}%
                </div>
              </div>
              <div className="bg-ios-card rounded-ios-lg p-4 shadow-ios">
                <div className="text-[12px] text-ios-text-secondary font-medium uppercase tracking-wide mb-1">Current Streak</div>
                <div className="text-[24px] font-bold text-ios-text">🔥 {streak}</div>
              </div>
              <div className="bg-ios-card rounded-ios-lg p-4 shadow-ios">
                <div className="text-[12px] text-ios-text-secondary font-medium uppercase tracking-wide mb-1">Best Streak</div>
                <div className="text-[24px] font-bold text-ios-text">🏆 {longest}</div>
              </div>
            </div>
          </div>

          {/* Weekly Returns Chart */}
          <div className="px-5 mb-6">
            <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
              Weekly Returns
            </div>
            <div className="bg-ios-card rounded-ios-lg p-4 shadow-ios">
              <WeeklyChart data={dailyReturns} />
            </div>
          </div>

          {/* Calendar Heat Map */}
          <div className="px-5 mb-6">
            <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
              Last 30 Days
            </div>
            <div className="bg-ios-card rounded-ios-lg p-4 shadow-ios">
              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-[10px] text-ios-text-secondary font-medium text-center">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {/* Padding for first week */}
                {calendarDays.length > 0 && Array.from({ length: calendarDays[0].dayOfWeek }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}

                {calendarDays.map(day => {
                  const hasData = day.data !== null
                  const ret = day.data?.totalReturn ?? 0
                  const isSelected = selectedDay?.date === day.date

                  let bgColor = 'var(--ios-separator)'
                  if (hasData) {
                    if (ret > 200) bgColor = '#22C55E'
                    else if (ret > 100) bgColor = '#4ADE80'
                    else if (ret > 0) bgColor = '#86EFAC'
                    else if (ret === 0) bgColor = 'var(--ios-separator)'
                    else bgColor = '#FCA5A5'
                  }

                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay(hasData ? day.data : null)}
                      className={`
                        aspect-square rounded-md transition-all duration-200 ios-press
                        ${isSelected ? 'ring-2 ring-ios-blue scale-110' : ''}
                      `}
                      style={{ backgroundColor: bgColor }}
                      title={day.date}
                    />
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'var(--ios-separator)' }} />
                  <span className="text-[10px] text-ios-text-secondary">No data</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#86EFAC]" />
                  <span className="text-[10px] text-ios-text-secondary">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" />
                  <span className="text-[10px] text-ios-text-secondary">High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Day Detail */}
          {selectedDay && (
            <div className="px-5 mb-6 animate-fade-in">
              <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
                {new Date(selectedDay.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="bg-ios-card rounded-ios-lg p-4 shadow-ios">
                <div className="flex justify-between items-center mb-4">
                  <div className={`text-[28px] font-bold ${selectedDay.totalReturn >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                    {selectedDay.totalReturn >= 0 ? '+' : ''}{selectedDay.totalReturn.toFixed(0)}%
                  </div>
                  <div className="text-[14px] text-ios-text-secondary">
                    🔥 {selectedDay.streak} day streak
                  </div>
                </div>

                {/* Day's allocations */}
                <div className="space-y-2">
                  {(() => {
                    const allocs = blocksToAllocations(selectedDay.blocks)
                    const multiplier = calculateMultiplier(selectedDay.streak)
                    return Object.entries(allocs)
                      .sort(([, a], [, b]) => b - a)
                      .map(([habitId, blocks]) => {
                        const habit = allHabits.find(h => h.id === habitId)
                        if (!habit) return null
                        const ret = calculateHabitReturn(habit, blocks, multiplier)
                        return (
                          <div key={habitId} className="flex items-center gap-3">
                            <span className="text-lg">{habit.emoji}</span>
                            <span className="text-[14px] text-ios-text flex-1">{habit.name}</span>
                            <span className="text-[13px] text-ios-text-secondary">{blocksToTime(blocks)}</span>
                            <span className={`text-[13px] font-medium ${ret >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                              {ret >= 0 ? '+' : ''}{ret.toFixed(1)}%
                            </span>
                          </div>
                        )
                      })
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          <div className="px-5 mb-6">
            <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
              Category Mix
            </div>
            <div className="bg-ios-card rounded-ios-lg p-5 shadow-ios">
              <CategoryBreakdown essential={catDist.essential} growth={catDist.growth} drain={catDist.drain} />
            </div>
          </div>

          {/* Top Habits */}
          {topHabitsList.length > 0 && (
            <div className="px-5 mb-6">
              <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
                Most Invested
              </div>
              <div className="bg-ios-card rounded-ios-lg overflow-hidden shadow-ios">
                {topHabitsList.map((item, idx) => (
                  <div key={item.habit.id} className={`flex items-center px-4 py-3 ${idx < topHabitsList.length - 1 ? 'border-b border-ios-separator' : ''}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg mr-3"
                      style={{ backgroundColor: `${item.habit.color}15` }}
                    >
                      {item.habit.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-medium text-ios-text">{item.habit.name}</div>
                      <div className="text-[12px] text-ios-text-secondary">
                        avg {item.avgBlocks.toFixed(1)} blocks/day
                      </div>
                    </div>
                    <div className="text-[14px] text-ios-text-secondary font-medium">
                      {blocksToTime(item.totalBlocks)} total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Best Day */}
          {best && (
            <div className="px-5 mb-6">
              <div className="text-[13px] text-ios-text-secondary font-semibold mb-3 uppercase tracking-wide px-1">
                Best Day
              </div>
              <div className="bg-ios-card rounded-ios-lg p-4 shadow-ios">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <div className="text-[17px] font-semibold text-ios-green">
                      +{best.totalReturn.toFixed(0)}%
                    </div>
                    <div className="text-[13px] text-ios-text-secondary">
                      {new Date(best.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      {' · '}{best.streak} day streak
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
