import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import InviteMemberModal from './InviteMemberModal'

const mockMutate = jest.fn()

jest.mock('@/hooks/invite/useCreateInvite', () => ({
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
  __esModule: true,
  default: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
  useApiMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}))

// Mock UserComboBox so we can programmatically select a user
jest.mock('./UserComboBox', () => ({
  UserComboBox: ({ onSelect }: { onSelect: (m: unknown) => void }) => (
    <button
      type="button"
      data-testid="user-combobox"
      onClick={() =>
        onSelect({ id: 'user-789', name: 'Test User', email: 'test@test.com', image: null })
      }
    >
      Select User
    </button>
  ),
}))

jest.mock('./UserSurface', () => ({
  __esModule: true,
  default: () => <div data-testid="user-surface" />,
}))

async function openModal() {
  const user = userEvent.setup()
  renderWithProviders(<InviteMemberModal />)
  await user.click(screen.getByRole('button', { name: /invite member/i }))
  await screen.findByRole('heading', { name: /invite member/i })
  return user
}

describe('InviteMemberModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls mutate with receiverId and projectId when a user is selected', async () => {
    const user = await openModal()

    // Select a user via the mocked combobox
    await user.click(screen.getByTestId('user-combobox'))

    await user.click(screen.getByRole('button', { name: /send invite/i }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1)
      expect(mockMutate).toHaveBeenCalledWith(
        { receiverId: 'user-789', projectId: 'project-123' },
        expect.any(Object),
      )
    })
  })

  it('does not submit when no user is selected', async () => {
    const user = await openModal()

    await user.click(screen.getByRole('button', { name: /send invite/i }))

    await waitFor(() => expect(mockMutate).not.toHaveBeenCalled())
  })
})
