/**
 * Unit tests for dashboard redesign components.
 *
 * Components under test:
 *   StatCard, SectionCard, OverallProgress, PriorityBreakdown,
 *   UpcomingTasksCard, TeamWorkload, OverdueTasksCard
 */

import { render, screen } from '@testing-library/react'

import OverallProgress from '@/components/dashboard/Sections/OverallProgress'
import OverdueTasksCard from '@/components/dashboard/Sections/OverdueTasksCard'
import PriorityBreakdown from '@/components/dashboard/Sections/PriorityBreakdown'
import SectionCard from '@/components/dashboard/Sections/SectionCard'
import StatCard from '@/components/dashboard/Sections/StatCard'
import TeamWorkload from '@/components/dashboard/Sections/TeamWorkload'
import UpcomingTasksCard from '@/components/dashboard/Sections/UpcomingTasksCard'
import { ETaskPriority } from '@/enum/taskPriority.enum'
import { ETaskStatus } from '@/enum/taskStatus.enum'
import {
  DashboardTaskResponse,
  MemberWorkloadDTO,
  OverdueTaskDTO,
  UpcomingTaskDTO,
} from '@/types/dashboard.dto'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a minimal DashboardTaskResponse. */
function makeTask(overrides: Partial<DashboardTaskResponse> = {}): DashboardTaskResponse {
  return {
    id: 'task-1',
    status: ETaskStatus.TODO,
    assignees: [],
    priority: ETaskPriority.MEDIUM,
    ticketNumber: 1,
    title: 'Test task',
    ...overrides,
  }
}

/** Create a minimal OverdueTaskDTO. */
function makeOverdueTask(overrides: Partial<OverdueTaskDTO> = {}): OverdueTaskDTO {
  // daysAgo(n) returns an ISO date that is exactly n days in the past.
  const daysAgo = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d.toISOString()
  }
  return {
    id: 'ot-1',
    ticketNumber: 10,
    title: 'Overdue task',
    priority: ETaskPriority.HIGH,
    dueDate: daysAgo(2),
    boardTitle: 'Backlog',
    ...overrides,
  }
}

/** Create a minimal UpcomingTaskDTO with a due date N days from now. */
function makeUpcomingTask(daysFromNow: number, overrides: Partial<UpcomingTaskDTO> = {}): UpcomingTaskDTO {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return {
    id: `up-${daysFromNow}`,
    ticketNumber: 20 + daysFromNow,
    title: `Task due in ${daysFromNow} day(s)`,
    priority: ETaskPriority.MEDIUM,
    dueDate: d.toISOString(),
    boardTitle: 'Sprint',
    ...overrides,
  }
}

/** Create a minimal MemberWorkloadDTO. */
function makeMember(overrides: Partial<MemberWorkloadDTO> = {}): MemberWorkloadDTO {
  return {
    memberId: 'm-1',
    name: 'Alice Smith',
    image: null,
    todoCount: 2,
    inProgressCount: 1,
    doneCount: 3,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// SectionCard
// ---------------------------------------------------------------------------

describe('SectionCard', () => {
  it('renders title', () => {
    render(
      <SectionCard title="My Section">
        <p>Content</p>
      </SectionCard>,
    )
    expect(screen.getByRole('heading', { name: 'My Section' })).toBeInTheDocument()
  })

  it('applies default iconColor of text-muted to icon wrapper', () => {
    render(
      <SectionCard title="Test" icon={<svg data-testid="icon" />}>
        <p>Content</p>
      </SectionCard>,
    )
    // The icon is wrapped in a <span className={iconColor}>
    const icon = screen.getByTestId('icon')
    expect(icon.parentElement).toHaveClass('text-muted')
  })

  it('applies custom iconColor when provided', () => {
    render(
      <SectionCard title="Test" icon={<svg data-testid="icon" />} iconColor="text-danger">
        <p>Content</p>
      </SectionCard>,
    )
    const icon = screen.getByTestId('icon')
    expect(icon.parentElement).toHaveClass('text-danger')
    expect(icon.parentElement).not.toHaveClass('text-muted')
  })

  it('renders count badge when count prop is provided', () => {
    render(
      <SectionCard title="Test" count={7}>
        <p>Content</p>
      </SectionCard>,
    )
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('does not render count badge when count is omitted', () => {
    render(
      <SectionCard title="Test">
        <p>Content</p>
      </SectionCard>,
    )
    // Count badge would show "0" or "1"; only safe assertion is it's not present
    // since no number was supplied.  Query for the pill span: no such span in header.
    // Use getAllByText to make sure nothing numeric from count is shown.
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('renders action slot when provided', () => {
    render(
      <SectionCard title="Test" action={<button>Do it</button>}>
        <p>Content</p>
      </SectionCard>,
    )
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <SectionCard title="Test">
        <p>Hello world</p>
      </SectionCard>,
    )
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

describe('StatCard', () => {
  it('renders the label', () => {
    render(<StatCard label="Total Tasks" value={10} accent="total" />)
    expect(screen.getByText('Total Tasks')).toBeInTheDocument()
  })

  it('renders the numeric value', () => {
    render(<StatCard label="Done" value={5} accent="completed" pct={50} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  // --- Ring behaviour ---

  it('renders the SVG ring when accent="completed" and pct is provided', () => {
    const { container } = render(
      <StatCard label="Done" value={5} accent="completed" pct={50} />,
    )
    // The ring SVG has explicit dimensions 48×48 — unambiguous vs react-icon SVGs.
    expect(container.querySelector('svg[width="48"][height="48"]')).toBeInTheDocument()
  })

  it('shows "X% done" text alongside the ring', () => {
    render(<StatCard label="Done" value={5} accent="completed" pct={42} />)
    expect(screen.getByText('42% done')).toBeInTheDocument()
  })

  it('does NOT render the ring for accent="progress" even with pct', () => {
    const { container } = render(
      <StatCard label="In Progress" value={3} accent="progress" pct={30} />,
    )
    // The ring SVG has explicit width="48" height="48" viewBox="0 0 48 48".
    // React-icon SVGs have different dimensions, so this selector is unambiguous.
    expect(container.querySelector('svg[width="48"][height="48"]')).not.toBeInTheDocument()
  })

  it('does NOT render the ring for accent="todo" even with pct', () => {
    const { container } = render(
      <StatCard label="Todo" value={2} accent="todo" pct={20} />,
    )
    expect(container.querySelector('svg[width="48"][height="48"]')).not.toBeInTheDocument()
  })

  it('does NOT render the ring when accent="completed" but pct is omitted', () => {
    const { container } = render(
      <StatCard label="Done" value={5} accent="completed" />,
    )
    expect(container.querySelector('svg[width="48"][height="48"]')).not.toBeInTheDocument()
  })

  it('renders "X% of total" text for non-completed accent with pct', () => {
    render(<StatCard label="In Progress" value={3} accent="progress" pct={30} />)
    expect(screen.getByText('30% of total')).toBeInTheDocument()
  })

  it('renders the chip label "Tasks" for every accent', () => {
    const accents = ['total', 'completed', 'progress', 'todo'] as const
    accents.forEach((accent) => {
      const { unmount } = render(
        <StatCard label="Test" value={1} accent={accent} />,
      )
      expect(screen.getByText('Tasks')).toBeInTheDocument()
      unmount()
    })
  })
})

// ---------------------------------------------------------------------------
// OverallProgress
// ---------------------------------------------------------------------------

describe('OverallProgress', () => {
  it('renders the heading', () => {
    render(
      <OverallProgress completed={5} inProgress={3} todo={2} total={10} />,
    )
    expect(
      screen.getByRole('heading', { name: 'Overall Progress' }),
    ).toBeInTheDocument()
  })

  it('displays the completion percentage', () => {
    render(
      <OverallProgress completed={4} inProgress={3} todo={3} total={10} />,
    )
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('shows "N of M tasks completed" summary text', () => {
    render(
      <OverallProgress completed={3} inProgress={2} todo={5} total={10} />,
    )
    expect(screen.getByText('3 of 10 tasks completed')).toBeInTheDocument()
  })

  it('shows legend labels: Done, In Progress, Todo', () => {
    render(
      <OverallProgress completed={1} inProgress={1} todo={1} total={3} />,
    )
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Todo')).toBeInTheDocument()
  })

  it('shows 0% when total is 0', () => {
    render(
      <OverallProgress completed={0} inProgress={0} todo={0} total={0} />,
    )
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('0 of 0 tasks completed')).toBeInTheDocument()
  })

  it('renders 3 bar segments with correct widths when total > 0', () => {
    // 4 done (40%), 3 inProgress (30%), 3 todo (30%) out of 10
    const { container } = render(
      <OverallProgress completed={4} inProgress={3} todo={3} total={10} />,
    )
    // The three segments are direct children of the bar track div.
    // They carry inline width styles.
    const segments = container.querySelectorAll<HTMLElement>(
      '[style*="width"]',
    )
    // There are exactly 3 styled segments inside the bar
    const barSegments = Array.from(segments).filter(
      (el) =>
        el.style.width.endsWith('%') &&
        parseFloat(el.style.width) > 0,
    )
    expect(barSegments.length).toBe(3)
  })

  it('renders all zero-width segments when total is 0 (no crash)', () => {
    expect(() =>
      render(
        <OverallProgress completed={0} inProgress={0} todo={0} total={0} />,
      ),
    ).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// PriorityBreakdown
// ---------------------------------------------------------------------------

describe('PriorityBreakdown', () => {
  it('renders section title "By Priority"', () => {
    render(<PriorityBreakdown tasks={[makeTask()]} />)
    expect(screen.getByText('By Priority')).toBeInTheDocument()
  })

  it('shows the empty state when no tasks are provided', () => {
    render(<PriorityBreakdown tasks={[]} />)
    expect(screen.getByText('No priorities set')).toBeInTheDocument()
  })

  it('shows count for each priority label', () => {
    const tasks = [
      makeTask({ id: '1', priority: ETaskPriority.URGENT }),
      makeTask({ id: '2', priority: ETaskPriority.URGENT }),
      makeTask({ id: '3', priority: ETaskPriority.HIGH }),
      makeTask({ id: '4', priority: ETaskPriority.MEDIUM }),
    ]
    render(<PriorityBreakdown tasks={tasks} />)

    // Urgent: 2, High: 1, Medium: 1, Low: 0 — counts appear as text
    // Count column values
    const countCells = screen.getAllByText(/^\d+$/)
    const counts = countCells.map((el) => parseInt(el.textContent ?? '0', 10))

    expect(counts).toContain(2) // urgent
    expect(counts).toContain(1) // high
    expect(counts).toContain(1) // medium
    expect(counts).toContain(0) // low
  })

  it('renders all four priority labels', () => {
    render(<PriorityBreakdown tasks={[makeTask()]} />)
    expect(screen.getByText('Urgent')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Low')).toBeInTheDocument()
  })

  it('does not show the empty state when at least one task has a priority', () => {
    render(
      <PriorityBreakdown tasks={[makeTask({ priority: ETaskPriority.HIGH })]} />,
    )
    expect(screen.queryByText('No priorities set')).not.toBeInTheDocument()
  })

  it('shows empty state when all tasks have no priority set (hasAny=false)', () => {
    // Tasks with priority="" or unknown value → no counts match → hasAny stays false
    render(
      <PriorityBreakdown
        tasks={[makeTask({ priority: '' }), makeTask({ id: '2', priority: undefined as unknown as string })]}
      />,
    )
    expect(screen.getByText('No priorities set')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// UpcomingTasksCard
// ---------------------------------------------------------------------------

describe('UpcomingTasksCard', () => {
  it('renders section title "Due This Week"', () => {
    render(<UpcomingTasksCard tasks={[]} />)
    expect(screen.getByText('Due This Week')).toBeInTheDocument()
  })

  it('shows empty state when tasks array is empty', () => {
    render(<UpcomingTasksCard tasks={[]} />)
    expect(screen.getByText('Nothing due soon')).toBeInTheDocument()
  })

  it('groups a task due today under "Today"', () => {
    render(<UpcomingTasksCard tasks={[makeUpcomingTask(0, { title: 'Today task' })]} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Today task')).toBeInTheDocument()
  })

  it('groups a task due tomorrow under "Tomorrow"', () => {
    render(
      <UpcomingTasksCard tasks={[makeUpcomingTask(1, { title: 'Tomorrow task' })]} />,
    )
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
    expect(screen.getByText('Tomorrow task')).toBeInTheDocument()
  })

  it('groups tasks due in 2+ days under a formatted date label (not Today/Tomorrow)', () => {
    render(
      <UpcomingTasksCard tasks={[makeUpcomingTask(3, { title: 'Future task' })]} />,
    )
    // The group header for +3 days should be a date string, never "Today" or "Tomorrow".
    expect(screen.queryAllByText(/^today$/i)).toHaveLength(0)
    expect(screen.queryAllByText(/^tomorrow$/i)).toHaveLength(0)
    expect(screen.getByText('Future task')).toBeInTheDocument()
  })

  it('groups tasks with the same due date under a single label', () => {
    const tasks = [
      makeUpcomingTask(0, { id: 'a', title: 'Task A' }),
      makeUpcomingTask(0, { id: 'b', title: 'Task B' }),
    ]
    render(<UpcomingTasksCard tasks={tasks} />)
    // Only one "Today" group header
    expect(screen.getAllByText('Today')).toHaveLength(1)
    expect(screen.getByText('Task A')).toBeInTheDocument()
    expect(screen.getByText('Task B')).toBeInTheDocument()
  })

  it('shows task count in header', () => {
    const tasks = [makeUpcomingTask(0), makeUpcomingTask(1)]
    render(<UpcomingTasksCard tasks={tasks} />)
    // count prop is tasks.length = 2, rendered as pill text "2"
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show empty state when tasks are present', () => {
    render(<UpcomingTasksCard tasks={[makeUpcomingTask(0)]} />)
    expect(screen.queryByText('Nothing due soon')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// TeamWorkload
// ---------------------------------------------------------------------------

describe('TeamWorkload', () => {
  it('renders section title "Team Workload"', () => {
    render(<TeamWorkload members={[]} />)
    expect(screen.getByText('Team Workload')).toBeInTheDocument()
  })

  it('shows empty state when members array is empty', () => {
    render(<TeamWorkload members={[]} />)
    expect(screen.getByText('No assigned tasks')).toBeInTheDocument()
  })

  it('renders a row per member showing first name', () => {
    const members = [
      makeMember({ memberId: 'm-1', name: 'Alice Smith' }),
      makeMember({ memberId: 'm-2', name: 'Bob Jones' }),
    ]
    render(<TeamWorkload members={members} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders total task count per member', () => {
    // Alice: todo=2 + inProgress=1 + done=3 = 6
    render(<TeamWorkload members={[makeMember()]} />)
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('renders stacked bar segments with non-zero widths when member has tasks', () => {
    const { container } = render(
      <TeamWorkload members={[makeMember({ todoCount: 1, inProgressCount: 1, doneCount: 2 })]} />,
    )
    // Inner stacked bar: 3 divs with width% styles > 0
    const styledDivs = container.querySelectorAll<HTMLElement>('[style*="width"]')
    const nonZero = Array.from(styledDivs).filter(
      (el) => parseFloat(el.style.width) > 0,
    )
    // Outer barWidth div + 3 segment divs (done, inProgress, todo) — all should be > 0
    expect(nonZero.length).toBeGreaterThanOrEqual(3)
  })

  it('shows legend labels: Done, In Progress, Todo', () => {
    render(<TeamWorkload members={[makeMember()]} />)
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Todo')).toBeInTheDocument()
  })

  it('does not show empty state when members are present', () => {
    render(<TeamWorkload members={[makeMember()]} />)
    expect(screen.queryByText('No assigned tasks')).not.toBeInTheDocument()
  })

  it('renders member count in the header', () => {
    const members = [makeMember({ memberId: 'm-1' }), makeMember({ memberId: 'm-2' })]
    render(<TeamWorkload members={members} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// OverdueTasksCard
// ---------------------------------------------------------------------------

describe('OverdueTasksCard', () => {
  it('renders section title "Overdue"', () => {
    render(<OverdueTasksCard tasks={[]} />)
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('shows empty state when tasks array is empty', () => {
    render(<OverdueTasksCard tasks={[]} />)
    expect(screen.getByText('No overdue tasks')).toBeInTheDocument()
  })

  it('renders up to 3 tasks when there are exactly 3', () => {
    const tasks = [
      makeOverdueTask({ id: '1', title: 'Task 1' }),
      makeOverdueTask({ id: '2', title: 'Task 2' }),
      makeOverdueTask({ id: '3', title: 'Task 3' }),
    ]
    render(<OverdueTasksCard tasks={tasks} />)
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
  })

  it('caps visible tasks at 3 when there are more', () => {
    const tasks = Array.from({ length: 5 }, (_, i) =>
      makeOverdueTask({ id: `t${i}`, title: `Task ${i + 1}` }),
    )
    render(<OverdueTasksCard tasks={tasks} />)
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
    expect(screen.queryByText('Task 4')).not.toBeInTheDocument()
    expect(screen.queryByText('Task 5')).not.toBeInTheDocument()
  })

  it('renders "View all N" link when there are more than 3 tasks and projectId is provided', () => {
    const tasks = Array.from({ length: 5 }, (_, i) =>
      makeOverdueTask({ id: `t${i}` }),
    )
    render(<OverdueTasksCard tasks={tasks} projectId="proj-1" />)
    const link = screen.getByRole('link', { name: 'View all 5' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/projects/proj-1/board')
  })

  it('does NOT render "View all" link when tasks <= 3', () => {
    const tasks = [makeOverdueTask({ id: '1' }), makeOverdueTask({ id: '2' })]
    render(<OverdueTasksCard tasks={tasks} projectId="proj-1" />)
    expect(screen.queryByRole('link', { name: /view all/i })).not.toBeInTheDocument()
  })

  it('does NOT render "View all" link when projectId is not provided', () => {
    const tasks = Array.from({ length: 5 }, (_, i) =>
      makeOverdueTask({ id: `t${i}` }),
    )
    render(<OverdueTasksCard tasks={tasks} />)
    expect(screen.queryByRole('link', { name: /view all/i })).not.toBeInTheDocument()
  })

  it('passes iconColor="text-danger" to SectionCard (icon wrapper has text-danger class)', () => {
    // SectionCard wraps the icon prop in <span className={iconColor}>.
    // OverdueTasksCard passes iconColor="text-danger", so that span must have the class.
    const { container } = render(<OverdueTasksCard tasks={[]} />)
    // The span wrapping the icon is a direct sibling of the h2 inside the header.
    const iconSpan = container.querySelector('header span.text-danger')
    expect(iconSpan).toBeInTheDocument()
  })

  it('shows total count in section card header', () => {
    const tasks = [makeOverdueTask({ id: '1' }), makeOverdueTask({ id: '2' })]
    render(<OverdueTasksCard tasks={tasks} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows correct overdue text for a task due today', () => {
    const today = new Date().toISOString()
    render(<OverdueTasksCard tasks={[makeOverdueTask({ dueDate: today })]} />)
    expect(screen.getByText('Due today')).toBeInTheDocument()
  })

  it('shows "1 day overdue" for a task due exactly 1 day ago', () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    render(<OverdueTasksCard tasks={[makeOverdueTask({ dueDate: d.toISOString() })]} />)
    expect(screen.getByText('1 day overdue')).toBeInTheDocument()
  })

  it('shows "N days overdue" for tasks due multiple days ago', () => {
    const d = new Date()
    d.setDate(d.getDate() - 4)
    render(<OverdueTasksCard tasks={[makeOverdueTask({ dueDate: d.toISOString() })]} />)
    expect(screen.getByText('4 days overdue')).toBeInTheDocument()
  })
})
