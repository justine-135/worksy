import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ETaskStatus } from '@/enum/taskStatus.enum'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import EditTaskBoardModal from './EditTaskBoardModal'

const mockUpdateMutate = jest.fn()

jest.mock('@/hooks/taskboard/useUpdateTaskBoardMutation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: mockUpdateMutate, isPending: false } }),
}))

jest.mock('@/hooks/taskboard/useDeleteTaskBoardMutation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: jest.fn(), isPending: false } }),
}))

jest.mock('@/hooks/taskboard/useSaveTaskBoardPositionMutation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: jest.fn(), isPending: false } }),
}))

jest.mock('@/hooks/taskboard/useGetTaskBoard', () => ({
  useGetTaskBoard: () => ({
    data: [{ id: 'board-1', title: 'Backlog', status: ETaskStatus.TODO }],
  }),
}))

jest.mock('@/hooks/taskboard/useInvalidateQuery', () => ({
  __esModule: true,
  default: () => ({ invalidateTaskBoards: jest.fn().mockResolvedValue(undefined) }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ projectId: 'project-123', userId: 'user-456', userPermissions: [], isLoadingPermissions: false }),
}))

jest.mock('@heroui/react/toast', () => ({
  toast: Object.assign(jest.fn(), { danger: jest.fn(), success: jest.fn() }),
}))

jest.mock('@/components/common/ConfirmModal', () => ({
  __esModule: true,
  default: () => null,
}))

const mockColumn = {
  id: 'board-1',
  title: 'Backlog',
  status: ETaskStatus.TODO,
  order: 0,
  tasks: [],
  project: { title: 'Test Project' },
}

async function openEditModal() {
  const user = userEvent.setup()
  renderWithProviders(<EditTaskBoardModal column={mockColumn} />)
  // Open the dropdown
  await user.click(screen.getByRole('button', { name: /column actions/i }))
  // Click "Edit details"
  await user.click(await screen.findByText('Edit details'))
  await screen.findByText('Edit Column')
  return user
}

describe('EditTaskBoardModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls mutate with updated title and status on submit', async () => {
    const user = await openEditModal()

    const titleInput = screen.getByPlaceholderText(/e\.g: backlog/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'In Progress')

    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledTimes(1)
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        {
          projectId: 'project-123',
          taskBoardId: 'board-1',
          title: 'In Progress',
          status: ETaskStatus.TODO,
        },
        expect.any(Object),
      )
    })
  })

  it('does not submit when title is cleared', async () => {
    const user = await openEditModal()

    const titleInput = screen.getByPlaceholderText(/e\.g: backlog/i)
    await user.clear(titleInput)

    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => expect(mockUpdateMutate).not.toHaveBeenCalled())
  })

  it('does not submit when title is shorter than 3 characters', async () => {
    const user = await openEditModal()

    const titleInput = screen.getByPlaceholderText(/e\.g: backlog/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'ab')

    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => expect(mockUpdateMutate).not.toHaveBeenCalled())
  })
})
