import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ETaskStatus } from '@/enum/taskStatus.enum'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import AddTaskBoardModal from './AddTaskBoardModal'

const mockMutate = jest.fn()

jest.mock('@/hooks/taskboard/useCreateTaskBoardMutation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: mockMutate, isPending: false } }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

const mockInvalidateTaskBoards = jest.fn().mockResolvedValue(undefined)

async function openModal() {
  const user = userEvent.setup()
  renderWithProviders(
    <AddTaskBoardModal
      invalidateTaskBoards={mockInvalidateTaskBoards}
      projectId="project-123"
    />,
  )
  await user.click(screen.getByRole('button'))
  await screen.findByText('Add New Board')
  return user
}

describe('AddTaskBoardModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls mutate with title and default status when form is valid', async () => {
    const user = await openModal()

    await user.type(screen.getByPlaceholderText(/e\.g: backlog/i), 'Backlog')
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(
        { title: 'Backlog', status: ETaskStatus.TODO, projectId: 'project-123' },
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

    await user.type(screen.getByPlaceholderText(/e\.g: backlog/i), 'ab')
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled())
  })
})
