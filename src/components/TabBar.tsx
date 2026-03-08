'use client'

import { memo } from 'react'

export type TabId = 'today' | 'history' | 'settings'

interface TabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const TABS: { id: TabId; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: 'today',
    label: 'Today',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={active ? 2.5 : 2} />
        <path d="M3 10H21" stroke="currentColor" strokeWidth={active ? 2.5 : 2} />
        <path d="M9 4V2" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" />
        <path d="M15 4V2" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" />
        {active && (
          <rect x="7" y="13" width="4" height="4" rx="1" fill="currentColor" />
        )}
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="14" width="4" height="7" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} />
        <rect x="10" y="9" width="4" height="12" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} />
        <rect x="16" y="4" width="4" height="17" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 2} />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (active) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={active ? 2.5 : 2} fill={active ? 'currentColor' : 'none'} />
        <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"
          stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" />
      </svg>
    ),
  },
]

export const TabBar = memo(function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-ios-card/90 backdrop-blur-xl border-t border-ios-separator">
        <div className="flex justify-around items-center pt-2 pb-2 max-w-lg mx-auto"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-col items-center gap-1 px-6 py-1 ios-press
                  transition-colors duration-200
                  ${isActive ? 'text-ios-blue' : 'text-ios-text-secondary'}
                `}
              >
                {tab.icon(isActive)}
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
})
