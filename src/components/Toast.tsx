'use client'

import { memo, useEffect, useState, useCallback } from 'react'

export interface ToastMessage {
  id: string
  text: string
  icon?: string
  type?: 'success' | 'info' | 'warning'
  duration?: number
}

interface ToastProps {
  messages: ToastMessage[]
  onDismiss: (id: string) => void
}

const ToastItem = memo(function ToastItem({
  message,
  onDismiss,
}: {
  message: ToastMessage
  onDismiss: () => void
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true))

    const duration = message.duration ?? 2200
    const exitTimer = setTimeout(() => {
      setIsExiting(true)
    }, duration)

    const removeTimer = setTimeout(() => {
      onDismiss()
    }, duration + 300)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(removeTimer)
    }
  }, [message.duration, onDismiss])

  return (
    <div
      className={`
        flex items-center gap-2.5 px-5 py-3 rounded-2xl
        bg-ios-text text-ios-bg
        shadow-xl backdrop-blur-xl
        transition-all duration-300 ease-out
        ${isVisible && !isExiting
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-95'
        }
      `}
      role="status"
      aria-live="polite"
    >
      {message.icon && <span className="text-lg">{message.icon}</span>}
      <span className="text-[14px] font-semibold">{message.text}</span>
    </div>
  )
})

export const Toast = memo(function Toast({ messages, onDismiss }: ToastProps) {
  if (messages.length === 0) return null

  return (
    <div className="fixed top-14 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      {messages.map(msg => (
        <ToastItem
          key={msg.id}
          message={msg}
          onDismiss={() => onDismiss(msg.id)}
        />
      ))}
    </div>
  )
})

// Hook for managing toasts
export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const show = useCallback((text: string, icon?: string, type?: ToastMessage['type'], duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setMessages(prev => [...prev, { id, text, icon, type, duration }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])

  return { messages, show, dismiss }
}
