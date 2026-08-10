import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] erro não tratado na renderização:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500" aria-hidden="true" />
          <h1 className="text-lg font-semibold text-gray-900">Algo deu errado</h1>
          <p className="max-w-sm text-sm text-gray-600">
            Ocorreu um erro inesperado nesta página. Você pode tentar recarregar — se o problema continuar,
            entre em contato com o suporte.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
