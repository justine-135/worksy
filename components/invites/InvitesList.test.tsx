import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { ProjectInviteResponseDTO } from '@/types/projectInvite.dto'

import InvitesList from './InvitesList'

const mockAcceptMutate = jest.fn()
const mockDeclineMutate = jest.fn()

jest.mock('@/hooks/member/useAcceptInvite', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: mockAcceptMutate, isPending: false } }),
}))

jest.mock('@/hooks/member/useDeclineInvite', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: mockDeclineMutate, isPending: false } }),
}))

jest.mock('@/hooks/common/useApiMessage', () => ({
  __esModule: true,
  default: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}))

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ userId: 'user-1' }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

const mockInvite: ProjectInviteResponseDTO = {
  id: 'invite-1',
  userSender: { id: 'sender-1', name: 'Alice', email: 'alice@example.com', image: null },
  project: { id: 'project-1', title: 'Cool Project', imageUrl: null, count: 2 },
  createdAt: new Date('2024-01-01'),
}

describe('InvitesList', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders project title and sender name for each invite', () => {
    renderWithProviders(<InvitesList data={[mockInvite]} />)
    expect(screen.getByText('Cool Project')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('calls accept mutation when Accept is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InvitesList data={[mockInvite]} />)

    await user.click(screen.getByRole('button', { name: /accept/i }))

    expect(mockAcceptMutate).toHaveBeenCalledWith(
      { inviteId: 'invite-1' },
      expect.any(Object),
    )
  })

  it('calls decline mutation when Decline is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InvitesList data={[mockInvite]} />)

    await user.click(screen.getByRole('button', { name: /decline/i }))

    expect(mockDeclineMutate).toHaveBeenCalledWith(
      { inviteId: 'invite-1' },
      expect.any(Object),
    )
  })

  it('renders nothing when data is empty', () => {
    const { container } = renderWithProviders(<InvitesList data={[]} />)
    expect(container.firstChild).toBeEmptyDOMElement()
  })
})
