/**
 * Unit tests for BoardSearch multi-filter chip bar.
 *
 * Mocking strategy:
 *  - framer-motion AnimatePresence/motion.span → renders children directly (no animations)
 *  - @heroui/react Popover family → minimal controlled stub
 *  - useGetProjectMembers → controlled jest mock
 *  - CustomAvatar → fallback text span
 *
 * Interaction strategy: the ghost input is a fully-controlled `value=""`
 * element — it cannot accept typed characters. All interactions use fireEvent
 * throughout to avoid async timing issues from mixing fireEvent + userEvent.setup().
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react'

import BoardSearch, { ActiveFilter } from '@/components/board/BoardSearch'

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
// PopoverContent renders (as role="dialog") when isOpen=true, hidden otherwise.
// We inject _popoverOpen via cloneElement so PopoverContent can gate on it.
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

// ─── useGetProjectMembers ─────────────────────────────────────────────────────
const mockUseGetProjectMembers = jest.fn()
jest.mock('@/hooks/member/useGetProjectMembers', () => ({
  useGetProjectMembers: (...args: unknown[]) => mockUseGetProjectMembers(...args),
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MEMBER_ALICE = {
  id: 'member-alice',
  user: { id: 'user-alice', name: 'Alice', email: 'alice@example.com', image: null },
}
const MEMBER_BOB = {
  id: 'member-bob',
  user: { id: 'user-bob', name: 'Bob', email: 'bob@example.com', image: null },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultMembersHook() {
  mockUseGetProjectMembers.mockReturnValue({
    data: { data: [MEMBER_ALICE, MEMBER_BOB] },
    isLoading: false,
  })
}

function renderBoardSearch(onFilterChange = jest.fn()) {
  const utils = render(
    <BoardSearch projectId="project-1" onFilterChange={onFilterChange} />,
  )
  return { ...utils, onFilterChange }
}

/** Dispatch spacebar keydown on the ghost input to open the type picker. */
function openTypePicker() {
  // Ghost input has role="combobox" in TableSearch (not "textbox")
  const ghostInput = screen.getByRole('combobox', { name: /add a filter/i })
  act(() => {
    ghostInput.focus()
    fireEvent.keyDown(ghostInput, { key: ' ', code: 'Space' })
  })
}

/** Dispatch backspace keydown on the ghost input to remove the last chip. */
function pressBackspaceOnGhostInput() {
  // Ghost input has role="combobox" in TableSearch (not "textbox")
  const ghostInput = screen.getByRole('combobox', { name: /add a filter/i })
  act(() => {
    ghostInput.focus()
    fireEvent.keyDown(ghostInput, { key: 'Backspace', code: 'Backspace' })
  })
}

/** Click a button found by accessible name. */
function click(accessibleName: RegExp | string) {
  act(() => {
    fireEvent.click(screen.getByRole('button', { name: accessibleName }))
  })
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockUseGetProjectMembers.mockReturnValue({ data: undefined, isLoading: false })
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BoardSearch — initial render', () => {
  it('renders a search region with accessible label', () => {
    renderBoardSearch()
    // TableSearch uses aria-label="Filter" (generic, not "Filter tasks")
    expect(screen.getByRole('search', { name: /^filter$/i })).toBeInTheDocument()
  })

  it('renders the ghost input with placeholder "Filter…" when no chips exist', () => {
    renderBoardSearch()
    // Ghost input has role="combobox" (not "textbox") in TableSearch
    const ghostInput = screen.getByRole('combobox', { name: /add a filter/i })
    expect(ghostInput).toBeInTheDocument()
    expect(ghostInput).toHaveAttribute('placeholder', 'Filter…')
  })

  it('renders no chip remove buttons initially', () => {
    renderBoardSearch()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('ghost input has aria-haspopup="listbox"', () => {
    renderBoardSearch()
    expect(screen.getByRole('combobox', { name: /add a filter/i })).toHaveAttribute(
      'aria-haspopup',
      'listbox',
    )
  })
})

describe('BoardSearch — type picker opens via spacebar', () => {
  it('shows all 4 filter types when no chips are active', () => {
    renderBoardSearch()
    openTypePicker()

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /^title$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^assignee$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^priority$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^status$/i })).toBeInTheDocument()
  })
})

describe('BoardSearch — adding a title chip', () => {
  it('placeholder changes to "Add filter…" once a chip is added', () => {
    renderBoardSearch()

    openTypePicker()
    click(/^title$/i)

    expect(screen.getByRole('combobox', { name: /add a filter/i })).toHaveAttribute(
      'placeholder',
      'Add filter…',
    )
  })

  it('calls onFilterChange with title value after 300 ms debounce', () => {
    jest.useFakeTimers()
    const onFilterChange = jest.fn()
    renderBoardSearch(onFilterChange)

    openTypePicker()
    click(/^title$/i)

    const titleInput = screen.getByRole('textbox', { name: /filter by title/i })
    act(() => {
      fireEvent.change(titleInput, { target: { value: 'auth' } })
    })

    expect(onFilterChange).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'title', value: 'auth' }),
      ]),
    )
    jest.useRealTimers()
  })

  it('does not fire onFilterChange before 300 ms', () => {
    jest.useFakeTimers()
    const onFilterChange = jest.fn()
    renderBoardSearch(onFilterChange)

    openTypePicker()
    click(/^title$/i)

    act(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /filter by title/i }), {
        target: { value: 'x' },
      })
      jest.advanceTimersByTime(299)
    })

    expect(onFilterChange).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('removes the title chip when the × button is clicked', () => {
    const onFilterChange = jest.fn()
    renderBoardSearch(onFilterChange)

    openTypePicker()
    click(/^title$/i)

    click(/remove title filter/i)

    expect(screen.queryByLabelText(/filter by title/i)).not.toBeInTheDocument()
    expect(onFilterChange).toHaveBeenLastCalledWith([])
  })
})

describe('BoardSearch — backspace removes last chip', () => {
  it('removes last chip when Backspace pressed on empty ghost input', () => {
    const onFilterChange = jest.fn()
    renderBoardSearch(onFilterChange)

    openTypePicker()
    click(/^title$/i)

    pressBackspaceOnGhostInput()

    expect(screen.queryByRole('button', { name: /remove title filter/i })).not.toBeInTheDocument()
    expect(onFilterChange).toHaveBeenLastCalledWith([])
  })
})

describe('BoardSearch — adding a priority chip', () => {
  it('adds priority chip and calls onFilterChange with HIGH', () => {
    const onFilterChange = jest.fn()
    renderBoardSearch(onFilterChange)

    openTypePicker()
    click(/^priority$/i)

    // Sub-popover opens immediately after handleTypeSelect
    click(/change priority filter value/i)
    click(/^high$/i)

    expect(
      screen.getByRole('button', { name: /change priority filter value/i }),
    ).toHaveTextContent('High')

    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'priority', value: 'HIGH', displayLabel: 'High' }),
      ]),
    )
  })

  it('shows all 4 priority options', () => {
    renderBoardSearch()

    openTypePicker()
    click(/^priority$/i)
    click(/change priority filter value/i)

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /urgent/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^high$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /medium/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^low$/i })).toBeInTheDocument()
  })
})

describe('BoardSearch — adding a status chip', () => {
  it('adds status chip and calls onFilterChange with TODO', () => {
    const onFilterChange = jest.fn()
    renderBoardSearch(onFilterChange)

    openTypePicker()
    click(/^status$/i)
    click(/change status filter value/i)
    click(/^todo$/i)

    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'status', value: 'TODO', displayLabel: 'Todo' }),
      ]),
    )
  })

  it('shows all 3 status options', () => {
    renderBoardSearch()

    openTypePicker()
    click(/^status$/i)
    click(/change status filter value/i)

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /^todo$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /in progress/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^done$/i })).toBeInTheDocument()
  })
})

describe('BoardSearch — adding an assignee chip', () => {
  it('adds assignee chip with Alice as displayLabel and member-alice as value', () => {
    defaultMembersHook()
    const onFilterChange = jest.fn()
    renderBoardSearch(onFilterChange)

    openTypePicker()
    click(/^assignee$/i)
    click(/change assignee filter value/i)
    click(/alice/i)

    expect(onFilterChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'assignee',
          value: 'member-alice',
          displayLabel: 'Alice',
        }),
      ]),
    )
  })

  it('filters member list by search query in assignee popover', () => {
    defaultMembersHook()
    renderBoardSearch()

    openTypePicker()
    click(/^assignee$/i)
    click(/change assignee filter value/i)

    act(() => {
      // AsyncPopoverContent search input has placeholder "Search…"
      fireEvent.change(screen.getByPlaceholderText(/search…/i), {
        target: { value: 'bob' },
      })
    })

    expect(screen.queryByRole('button', { name: /alice/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bob/i })).toBeInTheDocument()
  })

  it('shows 3 skeleton rows while assignees are loading', () => {
    mockUseGetProjectMembers.mockReturnValue({ data: undefined, isLoading: true })
    renderBoardSearch()

    openTypePicker()
    click(/^assignee$/i)
    click(/change assignee filter value/i)

    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('shows "No members found" when member list is empty', () => {
    mockUseGetProjectMembers.mockReturnValue({ data: { data: [] }, isLoading: false })
    renderBoardSearch()

    openTypePicker()
    click(/^assignee$/i)
    click(/change assignee filter value/i)

    // AsyncPopoverContent shows "No results found" (generic, not "No members found")
    expect(screen.getByText(/no results found/i)).toBeInTheDocument()
  })
})

describe('BoardSearch — AND logic (multi-filter)', () => {
  it('emits two ActiveFilter entries when priority+status chips are both set', () => {
    const onFilterChange = jest.fn()
    renderBoardSearch(onFilterChange)

    // Add priority=HIGH
    openTypePicker()
    click(/^priority$/i)
    click(/change priority filter value/i)
    click(/^high$/i)

    // Add status=TODO
    openTypePicker()
    click(/^status$/i)
    click(/change status filter value/i)
    click(/^todo$/i)

    const lastCall: ActiveFilter[] = onFilterChange.mock.calls.at(-1)[0]
    expect(lastCall).toHaveLength(2)
    expect(lastCall.find((f) => f.type === 'priority')).toMatchObject({ value: 'HIGH' })
    expect(lastCall.find((f) => f.type === 'status')).toMatchObject({ value: 'TODO' })
  })
})

describe('BoardSearch — ghost input hidden when all 4 types used', () => {
  it('hides ghost input after all 4 filter types are added', () => {
    defaultMembersHook()
    renderBoardSearch()

    openTypePicker()
    click(/^title$/i)

    openTypePicker()
    click(/^priority$/i)

    openTypePicker()
    click(/^status$/i)

    openTypePicker()
    click(/^assignee$/i)

    expect(screen.queryByRole('combobox', { name: /add a filter/i })).not.toBeInTheDocument()
  })
})

describe('BoardSearch — selective chip removal', () => {
  it('removes only the targeted chip while leaving others intact', () => {
    const onFilterChange = jest.fn()
    renderBoardSearch(onFilterChange)

    openTypePicker()
    click(/^priority$/i)

    openTypePicker()
    click(/^status$/i)

    click(/remove priority filter/i)

    expect(screen.queryByRole('button', { name: /remove priority filter/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove status filter/i })).toBeInTheDocument()

    const lastCall: ActiveFilter[] = onFilterChange.mock.calls.at(-1)[0]
    expect(lastCall).toHaveLength(1)
    expect(lastCall[0].type).toBe('status')
  })
})

describe('BoardSearch — type-picker only shows unused types', () => {
  it('hides "Priority" from the picker once a priority chip exists', () => {
    renderBoardSearch()

    // Add priority chip and pick a value so the sub-popover closes
    openTypePicker()
    click(/^priority$/i)
    click(/change priority filter value/i)
    click(/^high$/i)  // closes the sub-popover

    // Now open the type picker
    openTypePicker()

    // The type picker dialog should not contain "Priority" any more.
    // Use getAllByRole in case sub-popover is also open — pick the one with "Filter by" heading.
    const dialogs = screen.getAllByRole('dialog')
    const typePicker = dialogs.find((d) => within(d).queryByText(/filter by/i))
    expect(typePicker).toBeTruthy()
    expect(within(typePicker!).queryByRole('button', { name: /^priority$/i })).not.toBeInTheDocument()
    expect(within(typePicker!).getByRole('button', { name: /^status$/i })).toBeInTheDocument()
    expect(within(typePicker!).getByRole('button', { name: /^title$/i })).toBeInTheDocument()
    expect(within(typePicker!).getByRole('button', { name: /^assignee$/i })).toBeInTheDocument()
  })
})

describe('BoardSearch — chip × button accessibility', () => {
  it('has a descriptive aria-label on the remove button', () => {
    renderBoardSearch()

    openTypePicker()
    click(/^title$/i)

    expect(
      screen.getByRole('button', { name: /remove title filter/i }),
    ).toBeInTheDocument()
  })
})
