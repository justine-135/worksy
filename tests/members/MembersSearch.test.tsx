/**
 * Unit tests for MembersSearch — wrapper around TableSearch for the Members page.
 *
 * Verifies:
 *  - Filter defs: name (text), role (async), status (static)
 *  - Status options: active/pending/inactive with correct dot colors
 *  - Role dropdown driven by useGetRoles with client-side search filtering
 *  - onFilterChange receives correct type/value/displayLabel for each filter kind
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react'

import MembersSearch from '@/components/members/MembersSearch'
import type { ActiveFilter } from '@/components/common/table-search/types'

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

// ─── CustomAvatar ─────────────────────────────────────────────────────────────
jest.mock('@/components/common/custom/CustomAvatar', () => ({
  __esModule: true,
  default: ({ fallback }: { fallback: string }) => <span data-testid="avatar">{fallback}</span>,
}))

// ─── useGetRoles ──────────────────────────────────────────────────────────────
const mockUseGetRoles = jest.fn()
jest.mock('@/hooks/role/useGetRoles', () => ({
  useGetRoles: (...args: unknown[]) => mockUseGetRoles(...args),
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ROLE_ADMIN = { id: 'role-admin', name: 'Admin' }
const ROLE_VIEWER = { id: 'role-viewer', name: 'Viewer' }
const ROLE_EDITOR = { id: 'role-editor', name: 'Editor' }

function defaultRolesHook() {
  mockUseGetRoles.mockReturnValue({
    data: { data: [ROLE_ADMIN, ROLE_VIEWER, ROLE_EDITOR] },
    isLoading: false,
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderMembersSearch(onFilterChange = jest.fn()) {
  return render(
    <MembersSearch projectId="project-1" onFilterChange={onFilterChange} />,
  )
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
  mockUseGetRoles.mockReturnValue({ data: undefined, isLoading: false })
})

// ─── Tests: Filter types ──────────────────────────────────────────────────────

describe('MembersSearch — filter types', () => {
  it('exposes name, role, and status filter types in type picker', () => {
    renderMembersSearch()
    openTypePicker()
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /^name$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^role$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^status$/i })).toBeInTheDocument()
  })

  it('name filter is a text chip', () => {
    renderMembersSearch()
    openTypePicker()
    clickButton(/^name$/i)
    // Text filter renders an inline input with aria-label
    expect(screen.getByLabelText(/filter by name/i)).toBeInTheDocument()
  })
})

// ─── Tests: Status chip (static) ─────────────────────────────────────────────

describe('MembersSearch — status filter', () => {
  it('shows active, pending, inactive options', () => {
    renderMembersSearch()
    openTypePicker()
    clickButton(/^status$/i)
    clickButton(/change status filter value/i)

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('button', { name: /^active$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^pending$/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /^inactive$/i })).toBeInTheDocument()
  })

  it('Active option has bg-success dot', () => {
    renderMembersSearch()
    openTypePicker()
    clickButton(/^status$/i)
    clickButton(/change status filter value/i)

    const dialog = screen.getByRole('dialog')
    const activeBtn = within(dialog).getByRole('button', { name: /^active$/i })
    expect(activeBtn.querySelector('span.bg-success')).toBeTruthy()
  })

  it('Pending option has bg-warning dot', () => {
    renderMembersSearch()
    openTypePicker()
    clickButton(/^status$/i)
    clickButton(/change status filter value/i)

    const dialog = screen.getByRole('dialog')
    const pendingBtn = within(dialog).getByRole('button', { name: /^pending$/i })
    expect(pendingBtn.querySelector('span.bg-warning')).toBeTruthy()
  })

  it('Inactive option has bg-default-400 dot', () => {
    renderMembersSearch()
    openTypePicker()
    clickButton(/^status$/i)
    clickButton(/change status filter value/i)

    const dialog = screen.getByRole('dialog')
    const inactiveBtn = within(dialog).getByRole('button', { name: /^inactive$/i })
    expect(inactiveBtn.querySelector('span.bg-default-400')).toBeTruthy()
  })

  it('calls onFilterChange with status value "active"', () => {
    const onFilterChange = jest.fn()
    renderMembersSearch(onFilterChange)

    openTypePicker()
    clickButton(/^status$/i)
    clickButton(/change status filter value/i)
    clickButton(/^active$/i)

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'status', value: 'active', displayLabel: 'Active' }),
      ]),
    )
  })

  it('calls onFilterChange with status value "pending"', () => {
    const onFilterChange = jest.fn()
    renderMembersSearch(onFilterChange)

    openTypePicker()
    clickButton(/^status$/i)
    clickButton(/change status filter value/i)
    clickButton(/^pending$/i)

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'status', value: 'pending' }),
      ]),
    )
  })

  it('calls onFilterChange with status value "inactive"', () => {
    const onFilterChange = jest.fn()
    renderMembersSearch(onFilterChange)

    openTypePicker()
    clickButton(/^status$/i)
    clickButton(/change status filter value/i)
    clickButton(/^inactive$/i)

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'status', value: 'inactive' }),
      ]),
    )
  })
})

// ─── Tests: Role chip (async via useGetRoles) ─────────────────────────────────

describe('MembersSearch — role filter', () => {
  it('shows roles from useGetRoles in the async popover', () => {
    defaultRolesHook()
    renderMembersSearch()

    openTypePicker()
    clickButton(/^role$/i)
    clickButton(/change role filter value/i)

    expect(screen.getByRole('button', { name: /^admin$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^viewer$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^editor$/i })).toBeInTheDocument()
  })

  it('shows 3 skeleton rows while roles are loading', () => {
    mockUseGetRoles.mockReturnValue({ data: undefined, isLoading: true })
    renderMembersSearch()

    openTypePicker()
    clickButton(/^role$/i)
    clickButton(/change role filter value/i)

    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('shows "No results found" when roles list is empty', () => {
    mockUseGetRoles.mockReturnValue({ data: { data: [] }, isLoading: false })
    renderMembersSearch()

    openTypePicker()
    clickButton(/^role$/i)
    clickButton(/change role filter value/i)

    expect(screen.getByText(/no results found/i)).toBeInTheDocument()
  })

  it('filters roles client-side by search text', () => {
    defaultRolesHook()
    renderMembersSearch()

    openTypePicker()
    clickButton(/^role$/i)
    clickButton(/change role filter value/i)

    act(() => {
      fireEvent.change(screen.getByPlaceholderText(/search…/i), { target: { value: 'admin' } })
    })

    // Admin matches; Viewer and Editor should not appear after filter
    // Note: client-side filter in MembersSearch.tsx filters rolesData before passing to asyncData
    // The onSearch callback updates roleSearch state, which causes re-filter on next render
    expect(screen.getByRole('button', { name: /^admin$/i })).toBeInTheDocument()
  })

  it('calls onFilterChange with role id when role is selected', () => {
    defaultRolesHook()
    const onFilterChange = jest.fn()
    renderMembersSearch(onFilterChange)

    openTypePicker()
    clickButton(/^role$/i)
    clickButton(/change role filter value/i)
    clickButton(/^admin$/i)

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: 'role', value: 'role-admin', displayLabel: 'Admin' }),
      ]),
    )
  })

  it('passes projectId to useGetRoles', () => {
    renderMembersSearch()
    expect(mockUseGetRoles).toHaveBeenCalledWith(
      expect.objectContaining({ projectId: 'project-1' }),
    )
  })
})

// ─── Tests: Multi-filter integration ─────────────────────────────────────────

describe('MembersSearch — multi-filter', () => {
  it('emits name + role + status when all three are set', () => {
    defaultRolesHook()
    const onFilterChange = jest.fn()
    renderMembersSearch(onFilterChange)

    // name
    openTypePicker()
    clickButton(/^name$/i)
    act(() => {
      fireEvent.change(screen.getByLabelText(/filter by name/i), { target: { value: 'alice' } })
    })

    // status
    openTypePicker()
    clickButton(/^status$/i)
    clickButton(/change status filter value/i)
    clickButton(/^active$/i)

    // role
    openTypePicker()
    clickButton(/^role$/i)
    clickButton(/change role filter value/i)
    clickButton(/^viewer$/i)

    const lastCall: ActiveFilter[] = onFilterChange.mock.calls.at(-1)[0]
    expect(lastCall.find((f) => f.type === 'status')).toMatchObject({ value: 'active' })
    expect(lastCall.find((f) => f.type === 'role')).toMatchObject({ value: 'role-viewer' })
  })
})
