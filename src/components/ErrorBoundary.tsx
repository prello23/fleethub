"use client"

import { Component, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-sm w-full text-center shadow-sm">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={28} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Eitthvað fór úrskeiðis</h1>
            <p className="text-sm text-gray-500 mb-6">
              Villa kom upp í forritinu. Vinsamlegast reyndu aftur.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              Hlaða síðu aftur
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
