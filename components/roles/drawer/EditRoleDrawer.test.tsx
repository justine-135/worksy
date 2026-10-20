import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import EditRoleDrawer from './EditRoleDrawer'

const mockMutate = jest.fn()

jest.mock('@/hooks/role/useEditRoleMutation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: mockMutate, isPending: false } }),
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

jest.mock('@/hooks/common/useApiMessage', () => ({
  useApiMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}))

const mockRole = {
  id: 'role-1',
  name: 'Editor',
  permissions: [{ key: 'board.view' }, { key: 'task.view' }],
}

async function openDrawer() {
  const user = userEvent.setup()
  renderWithProviders(<EditRoleDrawer role={mockRole} />)
  // icon-only pencil button — only button present before drawer opens
  await user.click(screen.getByRole('button'))
  await screen.findByText(/edit role/i)
  return user
}

describe('EditRoleDrawer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('pre-fills name from the role prop', async () => {
    await openDrawer()
    expect(screen.getByDisplayValue('Editor')).toBeInTheDocument()
  })

  it('calls mutate with updated name, permissions and roleId', async () => {
    const user = await openDrawer()

    const nameInput = screen.getByDisplayValue('Editor')
    await user.clear(nameInput)
    await user.type(nameInput, 'Senior Editor')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(
        {
          name: 'Senior Editor',
          permissions: expect.arrayContaining([expect.any(String)]),
          roleId: 'role-1',
        },
        expect.any(Object),
      )
    })
  })

  it('does not submit when name is cleared', async () => {
    const user = await openDrawer()

    const nameInput = screen.getByDisplayValue('Editor')
    await user.clear(nameInput)

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled())
  })
})
