'use client'

import { useState, useCallback } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

const STEPS = [
  {
    emoji: '📊',
    title: 'Life Blocks',
    subtitle: 'Invest your time like a portfolio',
    description: 'Think of your day as a portfolio of investments. Allocate your time wisely and watch your returns compound.',
  },
  {
    emoji: '🧱',
    title: '100 Blocks a Day',
    subtitle: 'You have 16.6 waking hours',
    description: 'Each block is 10 minutes. You have exactly 100 blocks from 6 AM to 10:40 PM. How will you invest them?',
  },
  {
    emoji: '💎',
    title: 'Three Categories',
    subtitle: 'Blue Chips, Growth & Drains',
    description: 'Blue Chips are essentials like sleep and exercise. Growth habits build your future. Drains cost you returns.',
  },
  {
    emoji: '🔥',
    title: 'Streaks Compound',
    subtitle: 'Consistency multiplies returns',
    description: 'Every consecutive day increases your multiplier. A 7-day streak nearly doubles your returns. Stay consistent.',
  },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete()
    } else {
      setStep(s => s + 1)
    }
  }, [isLast, onComplete])

  const handleSkip = useCallback(() => {
    onComplete()
  }, [onComplete])

  const current = STEPS[step]

  return (
    <div className="min-h-screen bg-ios-bg flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-5">
        <button onClick={handleSkip} className="text-ios-text-secondary text-[15px] font-medium ios-press">
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 animate-tab-fade" key={step}>
        <span className="text-7xl mb-8">{current.emoji}</span>
        <h1 className="text-[28px] font-bold text-ios-text text-center tracking-tight mb-2">
          {current.title}
        </h1>
        <p className="text-[17px] text-ios-blue font-semibold text-center mb-4">
          {current.subtitle}
        </p>
        <p className="text-[15px] text-ios-text-secondary text-center leading-relaxed max-w-sm">
          {current.description}
        </p>
      </div>

      {/* Bottom */}
      <div className="px-8 pb-12">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step ? 'w-6 h-2 bg-ios-blue' : 'w-2 h-2 bg-ios-separator'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-ios-blue text-white text-[17px] font-semibold py-4 rounded-ios-lg ios-press shadow-ios-lg"
        >
          {isLast ? 'Get Started' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
