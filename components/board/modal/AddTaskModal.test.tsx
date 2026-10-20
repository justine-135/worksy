import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ETaskPriority } from '@/enum/taskPriority.enum'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import AddTaskModal from './AddTaskModal'

const mockMutate = jest.fn()

jest.mock('@/hooks/task/useCreateTask', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: mockMutate, isPending: false } }),
}))

jest.mock('@/hooks/member/useGetAssignees', () => ({
  useGetAssignees: () => ({ data: { data: [] }, isLoading: false }),
}))

jest.mock('@/hooks/project/useGetProject', () => ({
  useGetProject: () => ({
    data: { defaultTaskPriority: ETaskPriority.MEDIUM },
    isLoading: false,
  }),
}))

jest.mock('@/hooks/taskboard/useInvalidateQuery', () => ({
  __esModule: true,
  default: () => ({ invalidateTaskBoards: jest.fn().mockResolvedValue(undefined) }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

jest.mock('@heroui/react/toast', () => ({
  toast: Object.assign(jest.fn(), { danger: jest.fn(), success: jest.fn() }),
}))

jest.mock('@/hooks/common/useApiMessage', () => ({
  useApiMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}))

// Tiptap uses ProseMirror DOM APIs not available in jsdom
jest.mock('../../common/TiptapEditor', () => ({
  __esModule: true,
  default: ({ onChange }: { onChange: (v: string) => void }) => (
    <textarea
      data-testid="tiptap-editor"
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

// TaskRelationCombobox makes API calls — mock it
jest.mock('../common/TaskRelationCombobox', () => ({
  __esModule: true,
  default: () => <div data-testid="task-relation-combobox" />,
}))

async function openModal() {
  const user = userEvent.setup()
  renderWithProviders(
    <AddTaskModal projectId="project-123" taskBoardID="board-1" />,
  )
  // BiPlus button (only button before modal opens due to PermissionGuard)
  await user.click(screen.getByRole('button'))
  await screen.findByText('Add Task')
  return user
}

describe('AddTaskModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls mutate with title, default priority, and empty assignees on valid submit', async () => {
    const user = await openModal()

    await user.type(screen.getByPlaceholderText(/enter title/i), 'Fix login bug')

    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Fix login bug',
          projectId: 'project-123',
          taskBoardId: 'board-1',
          assignees: [],
          priority: ETaskPriority.MEDIUM,
          parentId: undefined,
        }),
        expect.any(Object),
      )
    })
  })

  it('does not submit when title is empty', async () => {
    const user = await openModal()

    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled())
  })

  it('does not submit when title is shorter than 3 characters', async () => {
    const user = await openModal()

    await user.type(screen.getByPlaceholderText(/enter title/i), 'ab')
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled())
  })
})
