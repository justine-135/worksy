import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import ProfileCard from './ProfileCard'

const mockMutateAsync = jest.fn()
const mockUseGetUserProfile = jest.fn()

jest.mock('@/hooks/user/useGetUserProfile', () => ({
  useGetUserProfile: (...args: unknown[]) => mockUseGetUserProfile(...args),
}))

jest.mock('@/hooks/user/useUpdateUserProfile', () => ({
  useUpdateUserProfile: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

// uploadAvatar imports @vercel/blob → undici (needs Web APIs not in jsdom)
jest.mock('@/lib/user/uploadAvatar.lib', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({ url: 'https://example.com/avatar.jpg' }),
}))

jest.mock('@/components/common/ImageDropZone', () => ({
  __esModule: true,
  default: () => <div data-testid="image-dropzone" />,
}))

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ userId: 'user-1', projectId: null, userPermissions: [], isLoadingPermissions: false }),
}))

jest.mock('@/hooks/common/useApiMessage', () => ({
  useApiMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

describe('ProfileCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetUserProfile.mockReturnValue({
      data: { name: 'Alice', email: 'alice@example.com', image: null },
      isLoading: false,
    })
  })

  it('shows loading text while profile data is fetching', () => {
    mockUseGetUserProfile.mockReturnValue({ data: undefined, isLoading: true })
    renderWithProviders(<ProfileCard />)
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('renders the name input when profile is loaded', () => {
    renderWithProviders(<ProfileCard />)
    // React Aria TextField controls the input value; find by placeholder
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
  })

  it('calls mutateAsync with updated name when form is submitted', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({})
    renderWithProviders(<ProfileCard />)

    const nameInput = screen.getByPlaceholderText('Your name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Bob')
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Bob' }),
      )
    })
  })

  it('does not submit when name is empty', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProfileCard />)

    const nameInput = screen.getByPlaceholderText('Your name')
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => expect(mockMutateAsync).not.toHaveBeenCalled())
  })
})
