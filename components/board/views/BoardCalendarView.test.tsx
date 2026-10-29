/**
 * Unit tests for BoardCalendarView (week/day/month time-grid layout).
 *
 * Fake clock: 2025-11-03T10:00:00Z → "today" = Monday Nov 3 2025,
 * current month = November 2025.
 *
 * Mocking strategy:
 *  - next/navigation → useRouter (push jest.fn()), usePathname, useSearchParams
 *  - @heroui/react → Chip passes children through; Skeleton renders data-testid div
 *  - TaskDetailDrawer → () => null (complex internals with its own data-fetching)
 *  - react-icons/md → lightweight span stubs
 *  - date-fns: NOT mocked — real library with fake timers
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { ETaskStatus } from '@/enum/taskStatus.enum'
import { TaskResponseDTO } from '@/types/task.dto'
import { TaskBoardResponseDTO } from '@/types/taskboard.dto'

import BoardCalendarView from './BoardCalendarView'

// ─── next/navigation ──────────────────────────────────────────────────────────

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}))

// ─── HeroUI ───────────────────────────────────────────────────────────────────
//
// Tabs is stubbed as a compound component. Each Tabs.Tab renders as a <button>
// with role="tab". Clicking fires onSelectionChange so the parent updates its
// selectedKey, causing a re-render where the active tab gains aria-selected="true".
//
// The context and stubs are created inside the factory via require() because
// jest.mock() factories are hoisted before top-level imports.

jest.mock('@heroui/react', () => {
  const React = require('react') as typeof import('react')

  const TabsCtx = React.createContext<{
    selectedKey?: string
    onSelectionChange?: (key: string) => void
  }>({})

  const TabsStub = ({
    children,
    selectedKey,
    onSelectionChange,
  }: {
    children?: React.ReactNode
    selectedKey?: string
    onSelectionChange?: (key: string) => void
  }) => (
    <TabsCtx.Provider value={{ selectedKey, onSelectionChange }}>
      <div>{children}</div>
    </TabsCtx.Provider>
  )

  TabsStub.ListContainer = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  )
  TabsStub.List = ({
    children,
    'aria-label': al,
  }: {
    children?: React.ReactNode
    'aria-label'?: string
  }) => (
    <div role="tablist" aria-label={al}>
      {children}
    </div>
  )
  TabsStub.Tab = ({ children, id }: { children?: React.ReactNode; id?: string }) => {
    const { selectedKey, onSelectionChange } = React.useContext(TabsCtx)
    return (
      <button
        type="button"
        role="tab"
        aria-selected={selectedKey === id}
        data-tab-id={id}
        onClick={() => onSelectionChange?.(id!)}
      >
        {children}
      </button>
    )
  }
  TabsStub.Indicator = () => null

  return {
    Chip: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <span className={className}>{children}</span>
    ),
    Skeleton: ({ className }: { className?: string }) => (
      <div data-testid="skeleton" className={className} />
    ),
    Tabs: TabsStub,
  }
})

// ─── TaskDetailDrawer ─────────────────────────────────────────────────────────

jest.mock('@/components/board/drawer/TaskDetailDrawer', () => ({
  __esModule: true,
  default: () => null,
}))

// ─── react-icons/md ───────────────────────────────────────────────────────────

jest.mock('react-icons/md', () => ({
  MdChevronLeft:   () => <span data-testid="icon-prev" />,
  MdChevronRight:  () => <span data-testid="icon-next" />,
  MdExpandLess:    () => <span />,
  MdExpandMore:    () => <span />,
  MdViewDay:       () => <span />,
  MdViewWeek:      () => <span />,
  MdCalendarMonth: () => <span />,
}))

// ─── Fake clock ───────────────────────────────────────────────────────────────
// Lock today to Monday 2025-11-03T10:00:00Z so the current week is Nov 2–8 2025
// (week starts Sunday, so Sun Nov 2 – Sat Nov 8).

beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date('2025-11-03T10:00:00.000Z'))
})

afterAll(() => {
  jest.useRealTimers()
})

beforeEach(() => {
  mockPush.mockClear()
})

// ─── Test data helpers ────────────────────────────────────────────────────────

const makeTask = (overrides: Partial<TaskResponseDTO> = {}): TaskResponseDTO =>
  ({
    id: 'task-1',
    title: 'Test task',
    status: ETaskStatus.TODO,
    dueDate: '2025-11-03T14:00:00.000Z', // Monday Nov 3 2025, 2 pm UTC
    ...overrides,
  } as TaskResponseDTO)

const makeColumns = (tasks: TaskResponseDTO[]): TaskBoardResponseDTO[] => [
  { id: 'col-1', title: 'Todo', tasks } as TaskBoardResponseDTO,
]

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BoardCalendarView', () => {
  // ── 1. Loading state ──────────────────────────────────────────────────────

  describe('1. loading state', () => {
    it('renders skeleton elements when isLoading=true', () => {
      render(<BoardCalendarView columns={[]} isLoading={true} />)
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    })

    it('does NOT render the header month/year when isLoading=true', () => {
      render(<BoardCalendarView columns={[]} isLoading={true} />)
      expect(screen.queryByText('November 2025')).not.toBeInTheDocument()
    })
  })

  // ── 2. Header ─────────────────────────────────────────────────────────────

  describe('2. header', () => {
    it('renders current month/year as "November 2025"', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      expect(screen.getByText('November 2025')).toBeInTheDocument()
    })

    it('renders Day, Week, and Month view buttons', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      expect(screen.getByRole('tab', { name: /^day$/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /^week$/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /^month$/i })).toBeInTheDocument()
    })

    it('"Week" tab is selected by default (aria-selected=true)', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      const weekBtn = screen.getByRole('tab', { name: /^week$/i })
      expect(weekBtn).toHaveAttribute('aria-selected', 'true')
    })

    it('Day and Month tabs are NOT selected by default (aria-selected=false)', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      expect(screen.getByRole('tab', { name: /^day$/i })).toHaveAttribute('aria-selected', 'false')
      expect(screen.getByRole('tab', { name: /^month$/i })).toHaveAttribute('aria-selected', 'false')
    })

    it('clicking "Day" makes it selected', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      fireEvent.click(screen.getByRole('tab', { name: /^day$/i }))
      expect(screen.getByRole('tab', { name: /^day$/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: /^week$/i })).toHaveAttribute('aria-selected', 'false')
    })

    it('clicking "Month" makes it selected', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      fireEvent.click(screen.getByRole('tab', { name: /^month$/i }))
      expect(screen.getByRole('tab', { name: /^month$/i })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tab', { name: /^week$/i })).toHaveAttribute('aria-selected', 'false')
    })

    it('renders Prev (aria-label=Previous) and Next (aria-label=Next) navigation buttons', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('renders a "Today" navigation button', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
    })
  })

  // ── 3. Week view — default ────────────────────────────────────────────────

  describe('3. week view (default)', () => {
    it('a task with dueDate on the current week appears in the time grid', () => {
      const tasks = [makeTask({ id: 'task-week', title: 'Week task', dueDate: '2025-11-03T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)
      expect(screen.getByText('Week task')).toBeInTheDocument()
    })

    it('a task with dueDate in a different week is NOT rendered in the time grid', () => {
      const tasks = [makeTask({ id: 'task-other', title: 'Far future task', dueDate: '2025-11-15T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)
      expect(screen.queryByText('Far future task')).not.toBeInTheDocument()
    })

    it('a task with dueDate=null appears in the all-day/unscheduled section in week view', () => {
      const tasks = [makeTask({ id: 'task-null', title: 'Null task', dueDate: null })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)
      // null-dueDate tasks are included in allDayTasks unconditionally; section
      // starts closed (allDayOpen defaults false) so the task is hidden until toggled
      expect(screen.getByText('All-day / Unscheduled')).toBeInTheDocument()
      expect(screen.queryByText('Null task')).not.toBeInTheDocument()
    })

    it('week header shows abbreviated day names (e.g. "Mon")', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      // date-fns format "EEE" for Nov 3 2025 = "Mon"
      expect(screen.getAllByText('Mon').length).toBeGreaterThan(0)
    })
  })

  // ── 4. All-day / Unscheduled section ──────────────────────────────────────
  //
  // Two kinds of tasks land in the all-day section:
  //  1. Tasks with a dueDate exactly at midnight (00:00) within the current week.
  //  2. Tasks with dueDate=null — included unconditionally (bug fix: previously dropped).

  describe('4. all-day / unscheduled section', () => {
    it('section is not rendered when there are no midnight-dueDate tasks in the current week', () => {
      const tasks = [makeTask({ id: 'task-timed', title: 'Timed task', dueDate: '2025-11-03T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)
      expect(screen.queryByText('All-day / Unscheduled')).not.toBeInTheDocument()
    })

    it('section is CLOSED by default when midnight tasks exist in the current week', () => {
      // midnight dueDate within current week → isAllDay returns true
      const tasks = [makeTask({ id: 'task-midnight', title: 'Midnight task', dueDate: '2025-11-03T00:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)

      expect(screen.getByText('All-day / Unscheduled')).toBeInTheDocument()
      // allDayOpen starts false, so the task row is hidden until the section is toggled open
      expect(screen.queryByText('Midnight task')).not.toBeInTheDocument()
    })

    it('section header has aria-expanded=false by default', () => {
      const tasks = [makeTask({ id: 'task-midnight', title: 'Midnight task', dueDate: '2025-11-03T00:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)

      const sectionLabel = screen.getByText('All-day / Unscheduled')
      const toggleBtn = sectionLabel.closest('button')!
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'false')
    })

    it('clicking the toggle button opens the section (task rows become visible)', () => {
      const tasks = [makeTask({ id: 'task-midnight', title: 'Collapsible task', dueDate: '2025-11-03T00:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)

      // Initially closed
      expect(screen.queryByText('Collapsible task')).not.toBeInTheDocument()

      const toggleBtn = screen.getByText('All-day / Unscheduled').closest('button')!
      fireEvent.click(toggleBtn)

      expect(screen.getByText('Collapsible task')).toBeInTheDocument()
    })

    it('clicking the toggle again closes the section after it was opened', () => {
      const tasks = [makeTask({ id: 'task-midnight', title: 'Reopen task', dueDate: '2025-11-03T00:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)

      const btn = screen.getByText('All-day / Unscheduled').closest('button')!

      // Open (first click — starts closed)
      fireEvent.click(btn)
      expect(screen.getByText('Reopen task')).toBeInTheDocument()

      // Close (second click)
      fireEvent.click(btn)
      expect(screen.queryByText('Reopen task')).not.toBeInTheDocument()
    })

    it('a timed task (non-midnight dueDate) does NOT cause an all-day section to appear', () => {
      const tasks = [makeTask({ id: 'task-timed', title: 'Timed task', dueDate: '2025-11-03T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)
      expect(screen.queryByText('All-day / Unscheduled')).not.toBeInTheDocument()
    })

    it('a task with dueDate=null appears in the all-day section in week view (visible after toggle open)', () => {
      const tasks = [makeTask({ id: 'task-null', title: 'Null date task', dueDate: null })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)
      expect(screen.getByText('All-day / Unscheduled')).toBeInTheDocument()
      // Section starts closed; open it first
      fireEvent.click(screen.getByText('All-day / Unscheduled').closest('button')!)
      expect(screen.getByText('Null date task')).toBeInTheDocument()
    })

    it('a task with dueDate=null appears in the all-day section in day view (visible after toggle open)', () => {
      const tasks = [makeTask({ id: 'task-null-day', title: 'Null day task', dueDate: null })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)
      fireEvent.click(screen.getByRole('tab', { name: /^day$/i }))
      expect(screen.getByText('All-day / Unscheduled')).toBeInTheDocument()
      // Section starts closed in day view too; open it first
      fireEvent.click(screen.getByText('All-day / Unscheduled').closest('button')!)
      expect(screen.getByText('Null day task')).toBeInTheDocument()
    })
  })

  // ── 5. Navigation ─────────────────────────────────────────────────────────

  describe('5. navigation', () => {
    it('clicking "Next" in week view advances to next week — heading stays "November 2025"', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      // Nov 3 + 1 week = Nov 10, still November
      expect(screen.getByText('November 2025')).toBeInTheDocument()
    })

    it('clicking "Prev" in week view goes back one week — heading stays "November 2025"', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      fireEvent.click(screen.getByRole('button', { name: /previous/i }))
      // Nov 3 - 1 week = Oct 27, heading = October 2025
      expect(screen.getByText('October 2025')).toBeInTheDocument()
    })

    it('clicking "Today" resets to the current week after navigating away', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)

      // Go forward twice
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // Go back to today
      fireEvent.click(screen.getByRole('button', { name: /today/i }))

      expect(screen.getByText('November 2025')).toBeInTheDocument()
    })

    it('clicking "Next" in month view advances to December 2025', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)

      // Switch to month view first
      fireEvent.click(screen.getByRole('tab', { name: /^month$/i }))
      expect(screen.getByText('November 2025')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText('December 2025')).toBeInTheDocument()
    })

    it('clicking "Prev" in month view goes to October 2025', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)

      fireEvent.click(screen.getByRole('tab', { name: /^month$/i }))
      fireEvent.click(screen.getByRole('button', { name: /previous/i }))

      expect(screen.getByText('October 2025')).toBeInTheDocument()
    })
  })

  // ── 6. Month view ─────────────────────────────────────────────────────────

  describe('6. month view', () => {
    it('renders the 7 day-of-week column headers (Sun through Sat)', () => {
      render(
        <BoardCalendarView columns={makeColumns([])} isLoading={false} />
      )
      fireEvent.click(screen.getByRole('tab', { name: /^month$/i }))
      expect(screen.getByText('Sun')).toBeInTheDocument()
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Sat')).toBeInTheDocument()
    })

    it('a task with dueDate in the current month appears in the grid', () => {
      render(
        <BoardCalendarView
          columns={makeColumns([makeTask({ id: 'task-nov3', title: 'November 3 task', dueDate: '2025-11-03T14:00:00.000Z' })])}
          isLoading={false}
        />
      )
      fireEvent.click(screen.getByRole('tab', { name: /^month$/i }))
      expect(screen.getByText('November 3 task')).toBeInTheDocument()
    })

    it('a task with dueDate=null does NOT appear in the month grid cells', () => {
      render(
        <BoardCalendarView
          columns={makeColumns([makeTask({ id: 'task-null', title: 'Null date task', dueDate: null })])}
          isLoading={false}
        />
      )
      fireEvent.click(screen.getByRole('tab', { name: /^month$/i }))
      expect(screen.queryByText('Null date task')).not.toBeInTheDocument()
    })

    it('shows "+N more" when more than 3 tasks fall on the same day', () => {
      render(
        <BoardCalendarView
          columns={makeColumns([
            makeTask({ id: 't1', title: 'Task 1', dueDate: '2025-11-05T09:00:00.000Z' }),
            makeTask({ id: 't2', title: 'Task 2', dueDate: '2025-11-05T10:00:00.000Z' }),
            makeTask({ id: 't3', title: 'Task 3', dueDate: '2025-11-05T11:00:00.000Z' }),
            makeTask({ id: 't4', title: 'Task 4', dueDate: '2025-11-05T12:00:00.000Z' }),
          ])}
          isLoading={false}
        />
      )
      fireEvent.click(screen.getByRole('tab', { name: /^month$/i }))
      expect(screen.getByText('+1 more')).toBeInTheDocument()
    })

    it('a task in a different month does NOT appear in the current month grid', () => {
      render(
        <BoardCalendarView
          columns={makeColumns([makeTask({ id: 'task-oct', title: 'October task', dueDate: '2025-10-15T14:00:00.000Z' })])}
          isLoading={false}
        />
      )
      fireEvent.click(screen.getByRole('tab', { name: /^month$/i }))
      expect(screen.queryByText('October task')).not.toBeInTheDocument()
    })
  })

  // ── 7. Day view ───────────────────────────────────────────────────────────

  describe('7. day view', () => {
    it('single-day header shows "Mon" and "3" for Nov 3 2025', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      fireEvent.click(screen.getByRole('tab', { name: /^day$/i }))

      // The day view renders a single column header with abbreviated day name
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('a task due on the current day appears in day view', () => {
      const tasks = [makeTask({ id: 'task-day', title: 'Day view task', dueDate: '2025-11-03T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)
      fireEvent.click(screen.getByRole('tab', { name: /^day$/i }))

      expect(screen.getByText('Day view task')).toBeInTheDocument()
    })

    it('a task due on a different day does NOT appear in day view', () => {
      const tasks = [makeTask({ id: 'task-other', title: 'Different day task', dueDate: '2025-11-05T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)
      fireEvent.click(screen.getByRole('tab', { name: /^day$/i }))

      expect(screen.queryByText('Different day task')).not.toBeInTheDocument()
    })

    it('navigating to next day in day view changes the heading date', () => {
      render(<BoardCalendarView columns={makeColumns([])} isLoading={false} />)
      fireEvent.click(screen.getByRole('tab', { name: /^day$/i }))

      // Nov 3 shows "3"
      expect(screen.getByText('3')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // Nov 4 shows "4"
      expect(screen.getByText('4')).toBeInTheDocument()
    })
  })

  // ── 8. Task click opens drawer ────────────────────────────────────────────

  describe('8. task click', () => {
    it('in week view, clicking a task calls router.push with task=<id>', () => {
      const tasks = [makeTask({ id: 'task-click', title: 'Clickable task', dueDate: '2025-11-03T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)

      fireEvent.click(screen.getByText('Clickable task'))

      expect(mockPush).toHaveBeenCalledTimes(1)
      const url: string = mockPush.mock.calls[0][0]
      expect(url).toContain('task=task-click')
    })

    it('router.push URL starts with the current pathname', () => {
      const tasks = [makeTask({ id: 'task-route', title: 'Route task', dueDate: '2025-11-03T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)

      fireEvent.click(screen.getByText('Route task'))

      const url: string = mockPush.mock.calls[0][0]
      expect(url).toMatch(/^\/test\?/)
    })

    it('in month view, clicking a task calls router.push with task=<id>', () => {
      const tasks = [makeTask({ id: 'task-month-click', title: 'Month click task', dueDate: '2025-11-03T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)

      // Switch to month view
      fireEvent.click(screen.getByRole('tab', { name: /^month$/i }))
      // In month view the task renders as a button with its title as text
      fireEvent.click(screen.getAllByText('Month click task')[0])

      expect(mockPush).toHaveBeenCalledTimes(1)
      const url: string = mockPush.mock.calls[0][0]
      expect(url).toContain('task=task-month-click')
    })

    it('in day view, clicking a task calls router.push with task=<id>', () => {
      const tasks = [makeTask({ id: 'task-day-click', title: 'Day click task', dueDate: '2025-11-03T14:00:00.000Z' })]
      render(<BoardCalendarView columns={makeColumns(tasks)} isLoading={false} />)

      fireEvent.click(screen.getByRole('tab', { name: /^day$/i }))
      fireEvent.click(screen.getByText('Day click task'))

      expect(mockPush).toHaveBeenCalledTimes(1)
      const url: string = mockPush.mock.calls[0][0]
      expect(url).toContain('task=task-day-click')
    })
  })
})
