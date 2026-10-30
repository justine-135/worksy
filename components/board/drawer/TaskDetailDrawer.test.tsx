import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ETaskPriority } from '@/enum/taskPriority.enum'
import { ETaskStatus } from '@/enum/taskStatus.enum'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { TaskResponseDTO } from '@/types/task.dto'

import TaskDetailDrawer from './TaskDetailDrawer'

const mockCommentMutate = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  usePathname: () => '/projects/project-1/board',
  useSearchParams: () => ({ get: jest.fn().mockReturnValue(null) }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

jest.mock('@/hooks/task/useGetTaskDetail', () => ({
  useGetTaskDetail: ({ isOpen }: { isOpen: boolean }) => ({
    data: isOpen ? mockTask : undefined,
    isLoading: false,
  }),
}))

jest.mock('@/hooks/activity/useCreateComment', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: mockCommentMutate, isPending: false } }),
}))

jest.mock('@/hooks/member/useGetProjectMembers', () => ({
  useGetProjectMembers: () => ({ data: { data: [] }, isLoading: false }),
}))

jest.mock('@/hooks/task/useUpdateTaskAssignees', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: jest.fn(), isPending: false } }),
}))

jest.mock('@/hooks/task/useUpdateTaskRelation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: jest.fn(), isPending: false } }),
}))

jest.mock('@/hooks/task/useUpdateTaskStatus', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: jest.fn(), isPending: false } }),
}))

jest.mock('@/hooks/taskboard/useGetTaskBoard', () => ({
  useGetTaskBoard: () => ({ data: [] }),
}))

jest.mock('@/hooks/taskboard/useInvalidateQuery', () => ({
  __esModule: true,
  default: () => ({ invalidateTaskBoards: jest.fn() }),
}))

jest.mock('@/hooks/taskboard/useSaveTaskPositionMutation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: jest.fn(), isPending: false } }),
}))

jest.mock('@/hooks/common/useApiMessage', () => ({
  __esModule: true,
  default: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
  useApiMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}))

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ projectId: 'project-1', userId: 'user-1' }),
}))

// Tiptap requires ProseMirror DOM APIs not available in jsdom
jest.mock('@/components/common/TiptapEditor', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (v: string) => void }) => (
    <textarea
      data-testid="tiptap-editor"
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

jest.mock('@/components/board/common/TaskRelationCombobox', () => ({
  __esModule: true,
  default: () => <div data-testid="task-relation-combobox" />,
}))

jest.mock('@/components/common/ActivityLog', () => ({
  __esModule: true,
  default: () => <div data-testid="activity-log" />,
}))

// ActivityLog also imports this
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}))

const mockTask: TaskResponseDTO = {
  id: 'task-1',
  projectId: 'project-1',
  taskBoardId: 'board-1',
  title: 'Fix login bug',
  ticketNumber: 42,
  description: null,
  status: ETaskStatus.TODO,
  priority: ETaskPriority.MEDIUM,
  assignees: [],
  createdBy: {
    user: { id: 'user-1', name: 'John Doe', email: 'john@example.com', image: null },
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  activityLog: [],
  parents: [],
  children: [],
  currentUser: { name: 'John Doe', email: 'john@example.com', image: null },
}

async function openDrawer() {
  const user = userEvent.setup()
  renderWithProviders(<TaskDetailDrawer id="task-1" title="Fix login bug" />)
  await user.click(screen.getByRole('button', { name: /fix login bug/i }))
  await screen.findByRole('dialog')
  return user
}

describe('TaskDetailDrawer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders task title as a clickable button', () => {
    renderWithProviders(<TaskDetailDrawer id="task-1" title="Fix login bug" />)
    expect(screen.getByRole('button', { name: /fix login bug/i })).toBeInTheDocument()
  })

  it('opens drawer when title is clicked', async () => {
    await openDrawer()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('submits comment when tiptap editor is filled and Comment is clicked', async () => {
    const user = await openDrawer()

    const editor = screen.getByTestId('tiptap-editor')
    await user.type(editor, 'This is a comment')
    await user.click(screen.getByRole('button', { name: /^comment$/i }))

    await waitFor(() => {
      expect(mockCommentMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'This is a comment',
          taskId: 'task-1',
          projectId: 'project-1',
        }),
        expect.any(Object),
      )
    })
  })

  it('does not submit comment when value is too short', async () => {
    const user = await openDrawer()

    const editor = screen.getByTestId('tiptap-editor')
    await user.type(editor, 'hi')
    await user.click(screen.getByRole('button', { name: /^comment$/i }))

    await waitFor(() => expect(mockCommentMutate).not.toHaveBeenCalled())
  })

  it('clears editor after comment is successfully submitted', async () => {
    mockCommentMutate.mockImplementation(
      (_data: unknown, { onSuccess }: { onSuccess: (r: unknown) => void }) => {
        onSuccess({ message: 'Comment added' })
      },
    )

    const user = await openDrawer()

    const editor = screen.getByTestId('tiptap-editor')
    await user.type(editor, 'This is a comment')
    await user.click(screen.getByRole('button', { name: /^comment$/i }))

    await waitFor(() => {
      expect((screen.getByTestId('tiptap-editor') as HTMLTextAreaElement).value).toBe('')
    })
  })
})
