import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import { ReactNode } from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(ui: ReactNode, options?: RenderOptions) {
  const queryClient = makeQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options,
  )
}
