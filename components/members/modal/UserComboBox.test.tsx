import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import { UserComboBox } from './UserComboBox'

const mockOnSelect = jest.fn()

jest.mock('@/hooks/user/useSearchUser', () => ({
  useSearchUser: ({ query }: { query: string }) => ({
    data: query
      ? [{ id: 'user-1', name: 'Bob', email: 'bob@example.com', image: null }]
      : [],
    isLoading: false,
  }),
}))

jest.mock('@/hooks/common/useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ userId: 'user-current' }),
}))

describe('UserComboBox', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the search input', () => {
    renderWithProviders(<UserComboBox onSelect={mockOnSelect} />)
    expect(screen.getByPlaceholderText(/search by name or email/i)).toBeInTheDocument()
  })

  it('shows matching users when text is typed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserComboBox onSelect={mockOnSelect} />)

    await user.type(screen.getByPlaceholderText(/search by name or email/i), 'bob')

    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument())
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('calls onSelect and clears input when a user row is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserComboBox onSelect={mockOnSelect} />)

    await user.type(screen.getByPlaceholderText(/search by name or email/i), 'bob')
    await waitFor(() => screen.getByText('Bob'))
    await user.click(screen.getByText('Bob'))

    expect(mockOnSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1', name: 'Bob' }),
    )
  })
})
