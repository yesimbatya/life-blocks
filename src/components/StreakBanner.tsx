'use client'

import { memo, useEffect, useState } from 'react'

interface StreakBannerProps {
  streak: number
  previousStreak: number | null
}

export const StreakBanner = memo(function StreakBanner({ streak, previousStreak }: StreakBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const streakIncreased = previousStreak !== null && streak > previousStreak
  const streakBroke = previousStreak !== null && previousStreak > 1 && streak === 1

  useEffect(() => {
    if (!streakIncreased && !streakBroke) return

    // Trigger entry animation
    const enterTimer = setTimeout(() => setIsVisible(true), 300)

    // Auto-dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      setIsDismissed(true)
    }, 4300)

    return () => {
      clearTimeout(enterTimer)
      clearTimeout(dismissTimer)
    }
  }, [streakIncreased, streakBroke])

  if ((!streakIncreased && !streakBroke) || isDismissed) return null

  return (
    <div
      className={`
        mx-5 mb-4 rounded-2xl overflow-hidden transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0 max-h-24' : 'opacity-0 -translate-y-4 max-h-0'}
      `}
    >
      {streakIncreased ? (
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 border border-orange-500/20 px-5 py-3.5 flex items-center gap-3">
          <span className="text-2xl animate-pulse-once">🔥</span>
          <div className="flex-1">
            <div className="text-[15px] font-bold text-ios-text">
              {streak} day streak!
            </div>
            <div className="text-[13px] text-ios-text-secondary">
              Your compound interest keeps growing
            </div>
          </div>
          <span className="text-[13px] font-bold text-orange-500 tabular-nums">
            {streak > 1 ? `${(streak - 1)}→${streak}` : '1'}
          </span>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20 border border-red-500/20 px-5 py-3.5 flex items-center gap-3">
          <span className="text-2xl">💔</span>
          <div className="flex-1">
            <div className="text-[15px] font-bold text-ios-text">
              Streak reset
            </div>
            <div className="text-[13px] text-ios-text-secondary">
              Was {previousStreak} days — start rebuilding today
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-[13px] text-ios-text-secondary font-medium ios-press"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
})
