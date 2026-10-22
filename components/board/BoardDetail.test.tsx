import { screen } from '@testing-library/react'

import { ETaskPriority } from '@/enum/taskPriority.enum'
import { ETaskStatus } from '@/enum/taskStatus.enum'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { TaskResponseDTO } from '@/types/task.dto'
import { TaskBoardResponseDTO } from '@/types/taskboard.dto'

import BoardDetail from './BoardDetail'

// ---- dnd-kit mocks ----

jest.mock('@dnd-kit/core', () => ({
  closestCorners: jest.fn(),
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  PointerSensor: class {},
  useDroppable: () => ({ isOver: false, setNodeRef: jest.fn() }),
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => []),
}))

jest.mock('@dnd-kit/sortable', () => ({
  horizontalListSortingStrategy: jest.fn(),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSortable: () => ({
    attributes: {},
    isDragging: false,
    listeners: {},
    setActivatorNodeRef: jest.fn(),
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
  }),
  verticalListSortingStrategy: jest.fn(),
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}))

// ---- useDragState mock ----

const mockUseDragState = jest.fn()

jest.mock('./useDragState', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseDragState(...args),
  getColumnId: (id: string) => `column-${id}`,
  getTaskId: (id: string) => `task-${id}`,
}))

// ---- data hooks ----

const mockUseGetTaskBoard = jest.fn()

jest.mock('@/hooks/taskboard/useGetTaskBoard', () => ({
  useGetTaskBoard: (...args: unknown[]) => mockUseGetTaskBoard(...args),
}))

jest.mock('@/hooks/taskboard/useInvalidateQuery', () => ({
  __esModule: true,
  default: () => ({ taskBoardQueryKey: ['taskBoard'], invalidateTaskBoards: jest.fn() }),
}))

jest.mock('@/hooks/taskboard/useSaveTaskBoardPositionMutation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: jest.fn() } }),
}))

jest.mock('@/hooks/taskboard/useSaveTaskPositionMutation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: jest.fn() } }),
}))

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ projectId: 'project-1', userId: 'user-1' }),
}))

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ setQueryData: jest.fn(), invalidateQueries: jest.fn() }),
}))

// ---- sub-component mocks ----

jest.mock('./modal/AddTaskBoardModal', () => ({ __esModule: true, default: () => null }))
jest.mock('./modal/AddTaskModal', () => ({ __esModule: true, default: () => null }))
jest.mock('./modal/EditTaskBoardModal', () => ({ __esModule: true, default: () => null }))
jest.mock('./drawer/TaskDetailDrawer', () => ({ __esModule: true, default: () => null }))
jest.mock('../common/custom/CustomAvatar', () => ({ __esModule: true, default: () => null }))

// ---- fixtures ----

// NOTE: getTaskBoard does NOT select taskBoardId or projectId on tasks, so those
// fields are undefined at runtime even though TaskResponseDTO types them as strings.
// The mock intentionally leaves taskBoardId as a non-matching value to reflect reality.
const mockTask: TaskResponseDTO = {
  id: 'task-1',
  projectId: '',
  taskBoardId: '',  // absent from API response — must not be used to find the column
  title: 'Fix login bug',
  ticketNumber: 42,
  description: null,
  status: ETaskStatus.TODO,
  priority: ETaskPriority.MEDIUM,
  assignees: [],
  createdBy: { user: { id: 'user-1', name: 'User', email: 'u@example.com', image: null } },
  createdAt: '2024-01-01T00:00:00.000Z',
  activityLog: [],
  parents: [],
  children: [],
  currentUser: { name: 'User', email: 'u@example.com', image: null },
}

const mockColumns: TaskBoardResponseDTO[] = [
  {
    id: 'col-1',
    title: 'Todo',
    status: ETaskStatus.TODO,
    order: 0,
    tasks: [mockTask],
    project: { title: 'Worksy' },
  },
]

function setupDragState(
  activeTask: TaskResponseDTO | null = null,
  activeTaskColumnId: string | null = null,
) {
  mockUseDragState.mockReturnValue({
    activeTask,
    activeTaskColumnId,
    activeColumn: null,
    handleDragStart: jest.fn(),
    handleDragOver: jest.fn(),
    handleDragEnd: jest.fn(),
  })
}

// ---- tests ----

describe('BoardDetail DragOverlay — projectTitle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetTaskBoard.mockReturnValue({ data: mockColumns, isLoading: false })
  })

  it('renders nothing inside the overlay when no task is being dragged', () => {
    setupDragState(null, null)
    renderWithProviders(<BoardDetail />)

    expect(screen.getByTestId('drag-overlay')).toBeEmptyDOMElement()
  })

  it('shows the project title in the ticket ID using the column from drag-start', () => {
    // activeTaskColumnId ('col-1') comes from dnd-kit data at drag start,
    // NOT from task.taskBoardId which is absent in the API response.
    setupDragState(mockTask, 'col-1')
    renderWithProviders(<BoardDetail />)

    const overlay = screen.getByTestId('drag-overlay')
    expect(overlay).toHaveTextContent('Worksy #42')
  })

  it('does not show "undefined" in the ticket ID while dragging', () => {
    setupDragState(mockTask, 'col-1')
    renderWithProviders(<BoardDetail />)

    expect(screen.getByTestId('drag-overlay')).not.toHaveTextContent('undefined')
  })

  it('shows "undefined" when activeTaskColumnId is not provided (regression guard)', () => {
    // If the overlay used task.taskBoardId (empty string → no column match),
    // projectTitle would be undefined and the ticket ID would be "undefined #42".
    // This test documents that the old broken approach fails.
    setupDragState(mockTask, null)
    renderWithProviders(<BoardDetail />)

    expect(screen.getByTestId('drag-overlay')).toHaveTextContent('undefined #42')
  })
})
