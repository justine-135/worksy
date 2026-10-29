/**
 * Unit tests for the generic TableSearch chip filter bar.
 *
 * Mocking strategy:
 *  - framer-motion → renders children directly (no animations)
 *  - @heroui/react Popover family → minimal controlled stub (same pattern as BoardSearch.test.tsx)
 *  - CustomAvatar → fallback text span
 *
 * Interaction strategy: ghost input is fully controlled (readOnly, value=""),
 * so all interactions use fireEvent throughout.
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MdCircle, MdPerson, MdTitle } from 'react-icons/md'

import TableSearch from '@/components/common/table-search/TableSearch'
import type { ActiveFilter, AsyncFilterData, FilterDef, FilterOption } from '@/components/common/table-search/types'

// ─── framer-motion ────────────────────────────────────────────────────────────
jest.mock('framer-motion', () => {
  const React = jest.requireActual<typeof import('react')>('react')

  const MotionSpan = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    ({ children, className, ...rest }, ref) => (
      <span ref={ref} className={className} {...rest}>
        {children}
      </span>
    ),
  )
  MotionSpan.displayName = 'MotionSpan'

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: { span: MotionSpan },
  }
})

// ─── HeroUI Popover ───────────────────────────────────────────────────────────
jest.mock('@heroui/react', () => {
  const React = jest.requireActual<typeof import('react')>('react')

  function Popover({
    isOpen,
    children,
  }: {
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
  }) {
    return (
      <>
        {React.Children.map(children, (child: unknown) => {
          if (!React.isValidElement(child)) return child
          const el = child as React.ReactElement
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return React.cloneElement(el, { _popoverOpen: isOpen ?? false } as any)
        })}
      </>
    )
  }

  function PopoverTrigger({ children }: { children: React.ReactNode; _popoverOpen?: boolean }) {
    return <>{children}</>
  }

  function PopoverContent({
    children,
    className,
    _popoverOpen,
  }: {
    children: React.ReactNode
    className?: string
    placement?: string
    _popoverOpen?: boolean
  }) {
    if (!_popoverOpen) return null
    return <div role="dialog" className={className}>{children}</div>
  }

  function Skeleton({ className }: { className?: string }) {
    return <div data-testid="skeleton" className={className} />
  }

  return { Popover, PopoverTrigger, PopoverContent, Skeleton }
})

// ─── CustomAvatar ─────────────────────────────────────────────────────────────
jest.mock('@/components/common/custom/CustomAvatar', () => ({
  __esModule: true,
  default: ({ fallback }: { fallback: string }) => (
    <span data-testid="avatar">{fallback}</span>
  ),
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const COLOR_OPTIONS: FilterOption[] = [
  { value: 'red', label: 'Red', dot: 'bg-danger' },
  { value: 'blue', label: 'Blue', dot: 'bg-primary' },
  { value: 'green', label: 'Green' }, // no dot
]

const MEMBER_OPTIONS: FilterOption[] = [
  { value: 'user-1', label: 'Alice', avatar: { src: 'alice.png', name: 'Alice' } },
  { value: 'user-2', label: 'Bob', avatar: { name: 'Bob' } }, // no src
  { value: 'user-3', label: 'Carol' }, // no avatar at all
]

const FILTER_DEFS_MIXED: FilterDef[] = [
  { type: 'name', label: 'Name', Icon: MdTitle, kind: 'text' },
  { type: 'color', label: 'Color', Icon: MdCircle, kind: 'static', options: COLOR_OPTIONS },
  { type: 'member', label: 'Member', Icon: MdPerson, kind: 'async' },
]

function makeAsyncData(overrides: Partial<AsyncFilterData> = {}): AsyncFilterData {
  return {
    items: MEMBER_OPTIONS,
    isLoading: false,
    search: '',
    onSearch: jest.fn(),
    ...overrides,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderTableSearch({
  filterDefs = FILTER_DEFS_MIXED,
  onFilterChange = jest.fn(),
  asyncData,
  placeholder,
}: {
  filterDefs?: FilterDef[]
  onFilterChange?: jest.Mock
  asyncData?: Record<string, AsyncFilterData>
  placeholder?: string
} = {}) {
  const utils = render(
    <TableSearch
      filterDefs={filterDefs}
      onFilterChange={onFilterChange}
      asyncData={asyncData}
      placeholder={placeholder}
    />,
  )
  return { ...utils, onFilterChange }
}

function getGhostInput() {
  return screen.getByRole('combobox', { name: /add a filter/i })
}

function openTypePicker() {
  const ghostInput = getGhostInput()
  act(() => {
    ghostInput.focus()
    fireEvent.keyDown(ghostInput, { key: ' ', code: 'Space' })
  })
}

function clickButton(name: RegExp | string) {
  act(() => {
    fireEvent.click(screen.getByRole('button', { name }))
  })
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── Tests: Initial render ────────────────────────────────────────────────────

describe('TableSearch — initial render', () => {
  it('renders a search region with aria-label="Filter"', () => {
    renderTableSearch()
    expect(screen.getByRole('search', { name: /^filter$/i })).toBeInTheDocument()
  })

  it('ghost input has role="combobox" and aria-haspopup="listbox"', () => {
    renderTableSearch()
    const ghost = getGhostInput()
    expect(ghost).toHaveAttribute('aria-haspopup', 'listbox')
    expect(ghost).toHaveAttribute('role', 'combobox')
  })

  it('ghost input shows default placeholder "Filter…"', () => {
    renderTableSearch()
    expect(getGhostInput()).toHaveAttribute('placeholder', 'Filter…')
  })

  it('respects custom placeholder prop', () => {
    renderTableSearch({ placeholder: 'Search tasks…' })
    expect(getGhostInput()).toHaveAttribute('placeholder', 'Search tasks…')
  })

  it('renders no chip remove buttons initially', () => {
    renderTableSearch()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('does not call onFilterChange on mount', () => {
    const onFilterChange = jest.fn()
    renderTableSearch({ onFilterChange })
    expect(onFilterChange).not.toHaveBeenCalled()
  })
})

// ─── Tests: Type picker ───────────────────────────────────────────────────────

describe('TableSearch — type picker', () => {
  it('opens when spacebar pressed on ghost input', () => {
    renderTableSearch()
    openTypePicker()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('lists all filter types', () => {
    renderTableSearch()
    openTypePicker()
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /^name$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^color$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^member$/i })).toBeInTheDocument()
  })

  it('opens when ghost input is clicked', () => {
    renderTableSearch()
    act(() => {
      fireEvent.click(getGhostInput())
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

// ─── Tests: Text filter chip ──────────────────────────────────────────────────

describe('TableSearch — text filter chip', () => {
  it('adds a text chip when "Name" type is selected', () => {
    renderTableSearch()
    openTypePicker()
    clickButton(/^name$/i)
    expect(screen.getByLabelText(/filter by name/i)).toBeInTheDocument()
  })

  it('placeholder changes to "Add filter…" after first chip', () => {
    renderTableSearch()
    openTypePicker()
    clickButton(/^name$/i)
    expect(getGhostInput()).toHaveAttribute('placeholder', 'Add filter…')
  })

  it('debounces text input at 300 ms', () => {
    jest.useFakeTimers()
    const onFilterChange = jest.fn()
    renderTableSearch({ onFilterChange })

    openTypePicker()
    clickButton(/^name$/i)

    act(() => {
      fireEvent.change(screen.getByLabelText(/filter by name/i), { target: { value: 'alice' } })
    })

    expect(onFilterChange).not.toHaveBeenCalled()

    act(() => { jest.advanceTimersByTime(300) })

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'name', value: 'alice' }),
      ]),
    )
    jest.useRealTimers()
  })

  it('does not fire onFilterChange before 300 ms', () => {
    jest.useFakeTimers()
    const onFilterChange = jest.fn()
    renderTableSearch({ onFilterChange })

    openTypePicker()
    clickButton(/^name$/i)

    act(() => {
      fireEvent.change(screen.getByLabelText(/filter by name/i), { target: { value: 'x' } })
      jest.advanceTimersByTime(299)
    })

    expect(onFilterChange).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('clears the debounce timer when the chip is removed', () => {
    jest.useFakeTimers()
    const onFilterChange = jest.fn()
    renderTableSearch({ onFilterChange })

    openTypePicker()
    clickButton(/^name$/i)

    act(() => {
      fireEvent.change(screen.getByLabelText(/filter by name/i), { target: { value: 'pending' } })
    })

    // Remove chip before timer fires — should fire immediately with empty array
    clickButton(/remove name filter/i)

    // onFilterChange called once synchronously (chip removal), not with the pending debounced value
    expect(onFilterChange).toHaveBeenCalledTimes(1)
    expect(onFilterChange).toHaveBeenCalledWith([])

    // Advancing time should NOT produce another call
    act(() => { jest.advanceTimersByTime(300) })
    expect(onFilterChange).toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('removes the text chip via × button', () => {
    renderTableSearch()
    openTypePicker()
    clickButton(/^name$/i)
    clickButton(/remove name filter/i)
    expect(screen.queryByLabelText(/filter by name/i)).not.toBeInTheDocument()
  })
})

// ─── Tests: Static filter chip ────────────────────────────────────────────────

describe('TableSearch — static filter chip (StaticPopoverContent)', () => {
  it('shows all static options when chip value button is clicked', () => {
    renderTableSearch()
    openTypePicker()
    clickButton(/^color$/i)
    clickButton(/change color filter value/i)

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /^red$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^blue$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^green$/i })).toBeInTheDocument()
  })

  it('renders dot element for options that have opt.dot', () => {
    renderTableSearch()
    openTypePicker()
    clickButton(/^color$/i)
    clickButton(/change color filter value/i)

    const dialog = screen.getByRole('dialog')
    // Red has dot: "bg-danger" — there should be a span with that class inside the Red button
    const redBtn = within(dialog).getByRole('button', { name: /^red$/i })
    expect(redBtn.querySelector('span.bg-danger')).toBeTruthy()
  })

  it('skips dot element for options without opt.dot', () => {
    renderTableSearch()
    openTypePicker()
    clickButton(/^color$/i)
    clickButton(/change color filter value/i)

    const dialog = screen.getByRole('dialog')
    // Green has no dot — no colored span inside the Green button
    const greenBtn = within(dialog).getByRole('button', { name: /^green$/i })
    const spans = Array.from(greenBtn.querySelectorAll('span'))
    // Only the label text span should exist (flex-1 class), no color dot
    const dotSpans = spans.filter((s) =>
      s.className.includes('bg-') && s.className.includes('rounded-full'),
    )
    expect(dotSpans).toHaveLength(0)
  })

  it('calls onFilterChange with selected value and displayLabel', () => {
    const onFilterChange = jest.fn()
    renderTableSearch({ onFilterChange })

    openTypePicker()
    clickButton(/^color$/i)
    clickButton(/change color filter value/i)
    clickButton(/^blue$/i)

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'color', value: 'blue', displayLabel: 'Blue' }),
      ]),
    )
  })

  it('chip button shows selected displayLabel after selection', () => {
    renderTableSearch()
    openTypePicker()
    clickButton(/^color$/i)
    clickButton(/change color filter value/i)
    clickButton(/^red$/i)

    expect(screen.getByRole('button', { name: /change color filter value/i }))
      .toHaveTextContent('Red')
  })

  it('shows check icon on selected option when re-opened', () => {
    renderTableSearch()
    openTypePicker()
    clickButton(/^color$/i)
    clickButton(/change color filter value/i)
    clickButton(/^blue$/i)

    // Re-open the sub-popover
    clickButton(/change color filter value/i)
    const dialog = screen.getByRole('dialog')
    const blueBtn = within(dialog).getByRole('button', { name: /^blue$/i })
    // Selected option renders MdCheck — it renders as an svg with class size-4
    expect(blueBtn.querySelector('svg')).toBeTruthy()
  })
})

// ─── Tests: Async filter chip ─────────────────────────────────────────────────

describe('TableSearch — async filter chip (AsyncPopoverContent)', () => {
  it('renders CustomAvatar when item.avatar is present', () => {
    renderTableSearch({ asyncData: { member: makeAsyncData() } })
    openTypePicker()
    clickButton(/^member$/i)
    clickButton(/change member filter value/i)

    // Alice has avatar → should render the avatar testid
    const avatars = screen.getAllByTestId('avatar')
    expect(avatars.length).toBeGreaterThan(0)
    // Alice's avatar fallback name
    expect(avatars.find((a) => a.textContent === 'Alice')).toBeTruthy()
  })

  it('skips CustomAvatar for items without avatar', () => {
    const optionsNoAvatar: FilterOption[] = [
      { value: 'r1', label: 'Role A' },
      { value: 'r2', label: 'Role B' },
    ]
    renderTableSearch({
      asyncData: {
        member: makeAsyncData({ items: optionsNoAvatar }),
      },
    })
    openTypePicker()
    clickButton(/^member$/i)
    clickButton(/change member filter value/i)

    // No avatar elements rendered
    expect(screen.queryAllByTestId('avatar')).toHaveLength(0)
    expect(screen.getByRole('button', { name: /role a/i })).toBeInTheDocument()
  })

  it('shows 3 skeleton rows while loading', () => {
    renderTableSearch({ asyncData: { member: makeAsyncData({ isLoading: true }) } })
    openTypePicker()
    clickButton(/^member$/i)
    clickButton(/change member filter value/i)

    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('shows "No results found" when items list is empty', () => {
    renderTableSearch({ asyncData: { member: makeAsyncData({ items: [] }) } })
    openTypePicker()
    clickButton(/^member$/i)
    clickButton(/change member filter value/i)

    expect(screen.getByText(/no results found/i)).toBeInTheDocument()
  })

  it('has a search input with placeholder "Search…"', () => {
    renderTableSearch({ asyncData: { member: makeAsyncData() } })
    openTypePicker()
    clickButton(/^member$/i)
    clickButton(/change member filter value/i)

    expect(screen.getByPlaceholderText(/search…/i)).toBeInTheDocument()
  })

  it('calls onSearch when search input value changes', () => {
    const onSearch = jest.fn()
    renderTableSearch({ asyncData: { member: makeAsyncData({ onSearch }) } })
    openTypePicker()
    clickButton(/^member$/i)
    clickButton(/change member filter value/i)

    act(() => {
      fireEvent.change(screen.getByPlaceholderText(/search…/i), { target: { value: 'al' } })
    })

    expect(onSearch).toHaveBeenCalledWith('al')
  })

  it('calls onFilterChange with selected async item', () => {
    const onFilterChange = jest.fn()
    renderTableSearch({
      onFilterChange,
      asyncData: { member: makeAsyncData() },
    })
    openTypePicker()
    clickButton(/^member$/i)
    clickButton(/change member filter value/i)

    // Alice's button contains a CustomAvatar (mocked to <span>Alice</span>) + label span "Alice"
    // giving an accessible name of "Alice Alice". Use getAllByRole and pick by value attribute.
    act(() => {
      const buttons = screen.getAllByRole('button', { name: /alice/i })
      // Find the one inside the dialog (the async item button, not the remove button etc.)
      fireEvent.click(buttons[0])
    })

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'member', value: 'user-1', displayLabel: 'Alice' }),
      ]),
    )
  })
})

// ─── Tests: Ghost input disappears when all types used ────────────────────────

describe('TableSearch — ghost input visibility', () => {
  it('hides ghost input once all filter types are consumed', () => {
    renderTableSearch({ asyncData: { member: makeAsyncData() } })

    openTypePicker()
    clickButton(/^name$/i)

    openTypePicker()
    clickButton(/^color$/i)

    openTypePicker()
    clickButton(/^member$/i)

    expect(screen.queryByRole('combobox', { name: /add a filter/i })).not.toBeInTheDocument()
  })

  it('re-shows ghost input after a chip is removed', () => {
    renderTableSearch({ asyncData: { member: makeAsyncData() } })

    // Add all 3 types
    openTypePicker()
    clickButton(/^name$/i)
    openTypePicker()
    clickButton(/^color$/i)
    openTypePicker()
    clickButton(/^member$/i)

    expect(screen.queryByRole('combobox', { name: /add a filter/i })).not.toBeInTheDocument()

    // Remove one chip — ghost input must reappear
    clickButton(/remove name filter/i)

    expect(screen.getByRole('combobox', { name: /add a filter/i })).toBeInTheDocument()
  })
})

// ─── Tests: Backspace removes last chip ───────────────────────────────────────

describe('TableSearch — backspace on ghost input', () => {
  it('removes the last chip on Backspace', () => {
    const onFilterChange = jest.fn()
    renderTableSearch({ onFilterChange })

    openTypePicker()
    clickButton(/^name$/i)

    act(() => {
      const ghost = getGhostInput()
      ghost.focus()
      fireEvent.keyDown(ghost, { key: 'Backspace', code: 'Backspace' })
    })

    expect(screen.queryByLabelText(/filter by name/i)).not.toBeInTheDocument()
    expect(onFilterChange).toHaveBeenLastCalledWith([])
  })

  it('does nothing on Backspace when there are no chips', () => {
    const onFilterChange = jest.fn()
    renderTableSearch({ onFilterChange })

    act(() => {
      const ghost = getGhostInput()
      ghost.focus()
      fireEvent.keyDown(ghost, { key: 'Backspace', code: 'Backspace' })
    })

    expect(onFilterChange).not.toHaveBeenCalled()
  })

  it('removes only the last chip when multiple exist', () => {
    const onFilterChange = jest.fn()
    renderTableSearch({ onFilterChange })

    openTypePicker()
    clickButton(/^name$/i)
    openTypePicker()
    clickButton(/^color$/i)

    act(() => {
      const ghost = getGhostInput()
      ghost.focus()
      fireEvent.keyDown(ghost, { key: 'Backspace', code: 'Backspace' })
    })

    // Color was added last — it should be removed; Name chip should remain
    expect(screen.queryByRole('button', { name: /remove color filter/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove name filter/i })).toBeInTheDocument()
    const lastCall: ActiveFilter[] = onFilterChange.mock.calls.at(-1)[0]
    expect(lastCall).toHaveLength(1)
    expect(lastCall[0].type).toBe('name')
  })
})

// ─── Tests: Multi-filter AND logic ────────────────────────────────────────────

describe('TableSearch — multi-filter', () => {
  it('emits color filter after selection, member chip is added silently', () => {
    const onFilterChange = jest.fn()
    renderTableSearch({ onFilterChange, asyncData: { member: makeAsyncData() } })

    openTypePicker()
    clickButton(/^color$/i)
    clickButton(/change color filter value/i)
    clickButton(/^red$/i)

    // Adding a chip type does NOT fire onFilterChange (no value selected yet).
    // onFilterChange is only called when a value is selected or text changes.
    const callAfterColorSelect: ActiveFilter[] = onFilterChange.mock.calls.at(-1)[0]
    expect(callAfterColorSelect.find((f) => f.type === 'color')).toMatchObject({ value: 'red' })

    // Now open member chip and select Alice — this triggers onFilterChange with both filters
    openTypePicker()
    clickButton(/^member$/i)
    clickButton(/change member filter value/i)
    act(() => {
      const buttons = screen.getAllByRole('button', { name: /alice/i })
      fireEvent.click(buttons[0])
    })

    const lastCall: ActiveFilter[] = onFilterChange.mock.calls.at(-1)[0]
    expect(lastCall.find((f) => f.type === 'color')).toMatchObject({ value: 'red' })
    expect(lastCall.find((f) => f.type === 'member')).toMatchObject({ value: 'user-1' })
  })

  it('type picker excludes types already in use', () => {
    renderTableSearch()

    openTypePicker()
    clickButton(/^color$/i)
    clickButton(/change color filter value/i)
    clickButton(/^red$/i)

    openTypePicker()

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByRole('button', { name: /^color$/i })).not.toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^name$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^member$/i })).toBeInTheDocument()
  })
})
