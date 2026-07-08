import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import toast, { Toaster as HotToaster } from 'react-hot-toast'
import App from './App'
import './index.css'

import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      // Ignore auth refresh errors which are handled by PocketBase
      if (error?.status === 401) return;
      toast.error(error?.message || 'Failed to fetch data')
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      toast.error(error?.message || 'Action failed')
    },
  }),
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HotToaster position="top-right" />
        <App />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>,
)
