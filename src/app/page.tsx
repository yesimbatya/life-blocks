'use client'

import { useState, useCallback } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TabBar, TabId } from '@/components/TabBar'
import { TodayView } from '@/components/views/TodayView'
import { HistoryView } from '@/components/views/HistoryView'
import { SettingsView } from '@/components/views/SettingsView'
import { Onboarding } from '@/components/Onboarding'

export default function Home() {
  const {
    blocks, allocations, streak, history, isLoaded,
    updateBlocks, settings, updateSettings, allHabits,
    addCustomHabit, removeCustomHabit, editCustomHabit,
  } = useLocalStorage()

  const [activeTab, setActiveTab] = useState<TabId>('today')

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
  }, [])

  const handleCompleteOnboarding = useCallback(() => {
    updateSettings({ onboardingComplete: true })
  }, [updateSettings])

  if (!isLoaded) {
    return (
      <ThemeProvider theme={settings.theme}>
        <div className="min-h-screen bg-ios-bg flex items-center justify-center">
          <div className="text-ios-text-secondary">Loading...</div>
        </div>
      </ThemeProvider>
    )
  }

  if (!settings.onboardingComplete) {
    return (
      <ThemeProvider theme={settings.theme}>
        <Onboarding onComplete={handleCompleteOnboarding} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={settings.theme}>
      <main className="min-h-screen bg-ios-bg">
        <div className="animate-tab-fade" key={activeTab}>
          {activeTab === 'today' && (
            <TodayView
              blocks={blocks}
              allocations={allocations}
              streak={streak}
              allHabits={allHabits}
              updateBlocks={updateBlocks}
            />
          )}
          {activeTab === 'history' && (
            <HistoryView
              history={history}
              streak={streak}
              allHabits={allHabits}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              allHabits={allHabits}
              onAddCustomHabit={addCustomHabit}
              onRemoveCustomHabit={removeCustomHabit}
              onEditCustomHabit={editCustomHabit}
              blocks={blocks}
              history={history}
            />
          )}
        </div>

        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </main>
    </ThemeProvider>
  )
}
