import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { AppRouter } from './routes/AppRouter'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/ui/Toast'
import { showErrorToast } from './utils/toastBus'
import { getErrorMessage } from './utils/getErrorMessage'

function handleQueryError(error: unknown) {
  // 401 já dispara redirect pro login via interceptor do axios — mostrar um
  // toast que some junto com a navegação só piscaria na tela.
  const status = (error as { response?: { status?: number } }).response?.status
  if (status === 401) return
  showErrorToast(getErrorMessage(error))
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
  queryCache: new QueryCache({ onError: handleQueryError }),
  mutationCache: new MutationCache({ onError: handleQueryError }),
})

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
        <ToastContainer />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
