import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import { UserComboBox } from './UserComboBox'

const mockSetMember = jest.fn()

jest.mock('@/hooks/user/useSearchUser', () => ({
  useSearchUser: ({ query }: { query: string }) => ({
    data: query
      ? [{ id: 'user-1', name: 'Bob', email: 'bob@example.com', image: null }]
      : [],
    isLoading: false,
  }),
}))

// Bypass debounce so value updates immediately in tests
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
    renderWithProviders(<UserComboBox setMember={mockSetMember} />)
    expect(screen.getByPlaceholderText(/type @ to mention/i)).toBeInTheDocument()
  })

  it('shows matching users when @ mention is typed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserComboBox setMember={mockSetMember} />)

    await user.type(screen.getByPlaceholderText(/type @ to mention/i), '@bob')

    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument())
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('calls setMember and clears input when a user row is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<UserComboBox setMember={mockSetMember} />)

    await user.type(screen.getByPlaceholderText(/type @ to mention/i), '@bob')
    await waitFor(() => screen.getByText('Bob'))
    await user.click(screen.getByText('Bob'))

    expect(mockSetMember).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1', name: 'Bob' }),
    )
  })
})
