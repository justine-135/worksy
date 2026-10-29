/**
 * Unit tests for RolesSearch — wrapper around TableSearch for the Roles page.
 *
 * Verifies:
 *  - Filter defs: name (text), permission (static)
 *  - Permission options cover all values from the Permissions enum
 *  - humanizePermission correctly capitalizes each dot-segment
 *    e.g. "board.status.edit" → "Board Status Edit"
 *  - onFilterChange receives correct type/value/displayLabel
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react'

import type { ActiveFilter } from '@/components/common/table-search/types'
import RolesSearch from '@/components/roles/RolesSearch'
import { Permissions } from '@/enum/permissions.enum'

// ─── framer-motion ────────────────────────────────────────────────────────────
jest.mock('framer-motion', () => {
  const React = jest.requireActual<typeof import('react')>('react')
  const MotionSpan = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    ({ children, className, ...rest }, ref) => (
      <span ref={ref} className={className} {...rest}>{children}</span>
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

  function Popover({ isOpen, children }: { isOpen?: boolean; onOpenChange?: (o: boolean) => void; children: React.ReactNode }) {
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

  function PopoverContent({ children, className, _popoverOpen }: { children: React.ReactNode; className?: string; placement?: string; _popoverOpen?: boolean }) {
    if (!_popoverOpen) return null
    return <div role="dialog" className={className}>{children}</div>
  }

  function Skeleton({ className }: { className?: string }) {
    return <div data-testid="skeleton" className={className} />
  }

  return { Popover, PopoverTrigger, PopoverContent, Skeleton }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderRolesSearch(onFilterChange = jest.fn()) {
  return render(<RolesSearch onFilterChange={onFilterChange} />)
}

function getGhostInput() {
  return screen.getByRole('combobox', { name: /add a filter/i })
}

function openTypePicker() {
  const ghost = getGhostInput()
  act(() => {
    ghost.focus()
    fireEvent.keyDown(ghost, { key: ' ', code: 'Space' })
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

// ─── Tests: Filter types ──────────────────────────────────────────────────────

describe('RolesSearch — filter types', () => {
  it('exposes name and permission filter types in type picker', () => {
    renderRolesSearch()
    openTypePicker()
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /^name$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^permission$/i })).toBeInTheDocument()
  })

  it('name filter is a text chip (inline input)', () => {
    renderRolesSearch()
    openTypePicker()
    clickButton(/^name$/i)
    expect(screen.getByLabelText(/filter by name/i)).toBeInTheDocument()
  })

  it('permission filter is a static chip (popover trigger button)', () => {
    renderRolesSearch()
    openTypePicker()
    clickButton(/^permission$/i)
    // Should render a "Select…" button (no value yet), not a text input
    expect(screen.getByRole('button', { name: /change permission filter value/i }))
      .toHaveTextContent('Select…')
  })
})

// ─── Tests: humanizePermission ────────────────────────────────────────────────

describe('RolesSearch — humanizePermission', () => {
  const cases: [string, string][] = [
    [Permissions.BoardStatusEdit, 'Board Status Edit'],
    [Permissions.BoardView, 'Board View'],
    [Permissions.TaskCreate, 'Task Create'],
    [Permissions.MemberInvite, 'Member Invite'],
    [Permissions.RolesCreate, 'Roles Create'],
    [Permissions.SettingsProjectView, 'Settings Project View'],
    [Permissions.DashboardView, 'Dashboard View'],
  ]

  it.each(cases)(
    'humanizes "%s" → "%s"',
    (permValue, expectedLabel) => {
      renderRolesSearch()
      openTypePicker()
      clickButton(/^permission$/i)
      clickButton(/change permission filter value/i)

      const dialog = screen.getByRole('dialog')
      // The option with this label must exist
      expect(within(dialog).getByRole('button', { name: new RegExp(`^${expectedLabel}$`, 'i') }))
        .toBeInTheDocument()
    },
  )
})

// ─── Tests: Permission options coverage ──────────────────────────────────────

describe('RolesSearch — permission options', () => {
  it('generates one option for every value in the Permissions enum', () => {
    renderRolesSearch()
    openTypePicker()
    clickButton(/^permission$/i)
    clickButton(/change permission filter value/i)

    const dialog = screen.getByRole('dialog')
    const allOptions = within(dialog).getAllByRole('button')
    const allPermissionValues = Object.values(Permissions)

    // Each enum value maps to exactly one button in the dropdown
    expect(allOptions).toHaveLength(allPermissionValues.length)
  })

  it('permission options have no dot (Permissions enum values are plain strings)', () => {
    renderRolesSearch()
    openTypePicker()
    clickButton(/^permission$/i)
    clickButton(/change permission filter value/i)

    const dialog = screen.getByRole('dialog')
    const allOptionButtons = within(dialog).getAllByRole('button')

    // No option should render a dot span
    const dotSpans = allOptionButtons.flatMap((btn) =>
      Array.from(btn.querySelectorAll('span')).filter((s) =>
        s.className.includes('bg-') && s.className.includes('rounded-full'),
      ),
    )
    expect(dotSpans).toHaveLength(0)
  })

  it('calls onFilterChange with the raw enum value (not the humanized label)', () => {
    const onFilterChange = jest.fn()
    renderRolesSearch(onFilterChange)

    openTypePicker()
    clickButton(/^permission$/i)
    clickButton(/change permission filter value/i)
    // Select "Board View" which maps to value Permissions.BoardView = "board.view"
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^board view$/i }))
    })

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'permission',
          value: Permissions.BoardView,
          displayLabel: 'Board View',
        }),
      ]),
    )
  })

  it('calls onFilterChange with board.status.edit value for "Board Status Edit"', () => {
    const onFilterChange = jest.fn()
    renderRolesSearch(onFilterChange)

    openTypePicker()
    clickButton(/^permission$/i)
    clickButton(/change permission filter value/i)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^board status edit$/i }))
    })

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'permission',
          value: Permissions.BoardStatusEdit, // "board.status.edit"
          displayLabel: 'Board Status Edit',
        }),
      ]),
    )
  })
})

// ─── Tests: Name text filter ──────────────────────────────────────────────────

describe('RolesSearch — name text filter', () => {
  it('debounces name input at 300 ms', () => {
    jest.useFakeTimers()
    const onFilterChange = jest.fn()
    renderRolesSearch(onFilterChange)

    openTypePicker()
    clickButton(/^name$/i)

    act(() => {
      fireEvent.change(screen.getByLabelText(/filter by name/i), { target: { value: 'admin' } })
    })

    expect(onFilterChange).not.toHaveBeenCalled()

    act(() => { jest.advanceTimersByTime(300) })

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'name', value: 'admin' }),
      ]),
    )
    jest.useRealTimers()
  })
})

// ─── Tests: Multi-filter ──────────────────────────────────────────────────────

describe('RolesSearch — multi-filter', () => {
  it('emits name + permission when both are set', () => {
    const onFilterChange = jest.fn()
    renderRolesSearch(onFilterChange)

    // Set name
    openTypePicker()
    clickButton(/^name$/i)
    act(() => {
      fireEvent.change(screen.getByLabelText(/filter by name/i), { target: { value: 'owner' } })
    })

    // Set permission
    openTypePicker()
    clickButton(/^permission$/i)
    clickButton(/change permission filter value/i)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^task delete$/i }))
    })

    const allCalls = onFilterChange.mock.calls
    const lastCall: ActiveFilter[] = allCalls.at(-1)[0]
    expect(lastCall.find((f) => f.type === 'permission')).toMatchObject({
      value: Permissions.TaskDelete,
    })
  })

  it('type picker hides name after name chip is added', () => {
    renderRolesSearch()

    openTypePicker()
    clickButton(/^name$/i)

    openTypePicker()
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByRole('button', { name: /^name$/i })).not.toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^permission$/i })).toBeInTheDocument()
  })

  it('hides ghost input once both name and permission chips are added', () => {
    renderRolesSearch()

    openTypePicker()
    clickButton(/^name$/i)

    openTypePicker()
    clickButton(/^permission$/i)

    expect(screen.queryByRole('combobox', { name: /add a filter/i })).not.toBeInTheDocument()
  })
})
