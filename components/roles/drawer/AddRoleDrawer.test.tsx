import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import AddRoleDrawer from './AddRoleDrawer'

const mockMutate = jest.fn()

jest.mock('@/hooks/role/useAddRoleMutation', () => ({
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

async function openDrawer() {
  const user = userEvent.setup()
  renderWithProviders(<AddRoleDrawer />)
  await user.click(screen.getByRole('button', { name: /add role/i }))
  await screen.findByText('Add Role', { selector: '[data-slot="drawer-heading"]' })
  return user
}

describe('AddRoleDrawer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls mutate with name, permissions and projectId when form is valid', async () => {
    const user = await openDrawer()

    await user.type(screen.getByPlaceholderText(/enter role name/i), 'Developer')
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(
        {
          name: 'Developer',
          permissions: expect.arrayContaining([expect.any(String)]),
          projectId: 'project-123',
        },
        expect.any(Object),
      )
    })
  })

  it('does not submit when name is missing', async () => {
    const user = await openDrawer()

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled())
  })

  it('does not submit when no permissions are selected', async () => {
    const user = await openDrawer()

    await user.type(screen.getByPlaceholderText(/enter role name/i), 'Developer')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled())
  })
})
