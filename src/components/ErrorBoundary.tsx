'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  handleClearData = () => {
    try {
      localStorage.removeItem('life-blocks-data')
      window.location.reload()
    } catch (e) {
      console.error('Failed to clear data:', e)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-ios-bg flex items-center justify-center p-5">
          <div className="bg-ios-card rounded-ios-xl p-6 shadow-ios max-w-sm w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-[20px] font-bold text-ios-text mb-2">
              Something went wrong
            </h2>
            <p className="text-[14px] text-ios-gray-1 mb-6">
              The app encountered an unexpected error. You can try refreshing or clearing your data.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-ios-blue text-white font-semibold py-3 rounded-ios ios-press"
              >
                Try Again
              </button>
              <button
                onClick={this.handleClearData}
                className="w-full bg-ios-gray-6 text-ios-red font-semibold py-3 rounded-ios ios-press"
              >
                Clear Data & Reload
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
