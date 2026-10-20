import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StatusDTO } from '@/enum/member'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import EditMember from './EditMember'

const mockMutate = jest.fn()

jest.mock('@/hooks/member/useUpdateMemberStatusRole', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: mockMutate, isPending: false } }),
}))

jest.mock('@/hooks/role/useGetRoles', () => ({
  useGetRoles: () => ({
    data: { data: [{ id: 'role-1', name: 'Developer' }] },
  }),
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

const defaultProps = {
  status: StatusDTO.active,
  role: { id: 'role-1', name: 'Developer' },
  userId: 'user-789',
  page: 1,
}

async function openModal() {
  const user = userEvent.setup()
  renderWithProviders(<EditMember {...defaultProps} />)
  // icon-only pencil button
  await user.click(screen.getByRole('button'))
  await screen.findByText('Edit Member')
  return user
}

describe('EditMember', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls mutate with current status, roleId and userId on submit', async () => {
    const user = await openModal()

    await user.click(screen.getByRole('button', { name: /update member/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(
        {
          status: StatusDTO.active,
          roleId: 'role-1',
          userId: 'user-789',
        },
        expect.any(Object),
      )
    })
  })

  it('does not submit when roleId is too short', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <EditMember
        {...defaultProps}
        role={{ id: 'ab', name: 'Short' }}
      />,
    )
    await user.click(screen.getByRole('button'))
    await screen.findByText('Edit Member')

    await user.click(screen.getByRole('button', { name: /update member/i }))

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled())
  })
})
