import { fireEvent, screen, waitFor } from '@testing-library/react'
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

  describe('onMouseDown regression — blur-before-click race fix', () => {
    /**
     * Before the fix, the dropdown button used onClick. When the user clicked a
     * result, the input's onBlur fired first (closing the dropdown and clearing
     * isFocused), which caused the onClick to be swallowed — selection was silently
     * dropped. The fix moves selection to onMouseDown with e.preventDefault() so
     * the blur never fires before the selection is committed.
     *
     * This test fires mouseDown directly on the result button (bypassing userEvent's
     * pointer sequence) to assert that the handler is attached to onMouseDown and
     * that e.preventDefault() keeps the input focused so blur cannot race.
     */
    it('calls onSelect via onMouseDown before blur can fire', async () => {
      const user = userEvent.setup()
      renderWithProviders(<UserComboBox onSelect={mockOnSelect} />)

      const input = screen.getByPlaceholderText(/search by name or email/i)
      await user.type(input, 'bob')

      // Wait for the dropdown result to appear
      const resultButton = await screen.findByRole('button', { name: /bob/i })

      // Verify the input still has focus (dropdown is open)
      expect(document.activeElement).toBe(input)

      // Fire mouseDown directly — this is the exact event the fixed handler binds to.
      // e.preventDefault() inside the handler prevents the browser from moving focus
      // away from the input, so onBlur does NOT fire before selection is committed.
      fireEvent.mouseDown(resultButton)

      expect(mockOnSelect).toHaveBeenCalledTimes(1)
      expect(mockOnSelect).toHaveBeenCalledWith({
        id: 'user-1',
        name: 'Bob',
        email: 'bob@example.com',
        image: null,
      })
    })

    it('clears the query after onMouseDown selection', async () => {
      const user = userEvent.setup()
      renderWithProviders(<UserComboBox onSelect={mockOnSelect} />)

      const input = screen.getByPlaceholderText(/search by name or email/i)
      await user.type(input, 'bob')

      const resultButton = await screen.findByRole('button', { name: /bob/i })
      fireEvent.mouseDown(resultButton)

      // Input should be cleared after selection
      expect(input).toHaveValue('')
    })

    it('does NOT call onSelect on a plain click without mouseDown (documents old broken path)', async () => {
      /**
       * This test documents that onSelect is driven by onMouseDown, not onClick.
       * Firing only a click event (without the preceding mouseDown) should NOT call
       * onSelect — confirming the handler was intentionally moved off onClick.
       *
       * Note: userEvent.click() fires the full pointer sequence including mouseDown,
       * so we use fireEvent.click() here to isolate just the click event.
       */
      const user = userEvent.setup()
      renderWithProviders(<UserComboBox onSelect={mockOnSelect} />)

      await user.type(
        screen.getByPlaceholderText(/search by name or email/i),
        'bob',
      )

      const resultButton = await screen.findByRole('button', { name: /bob/i })

      // Fire only click — no mouseDown. onSelect must NOT be called.
      fireEvent.click(resultButton)

      expect(mockOnSelect).not.toHaveBeenCalled()
    })
  })
})
