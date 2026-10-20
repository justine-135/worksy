import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import AddProjectModal from './AddProjectModal'

const mockMutateAsync = jest.fn().mockResolvedValue({ message: 'Project created' })

jest.mock('@/hooks/project/useCreateProjectMutation', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutateAsync: mockMutateAsync, isPending: false } }),
}))

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ projectId: 'project-123', userId: 'user-456', userPermissions: [], isLoadingPermissions: false }),
}))

jest.mock('@heroui/react/toast', () => ({
  toast: Object.assign(jest.fn(), { danger: jest.fn(), success: jest.fn() }),
}))

// ImageDropZone uses next/image and URL.createObjectURL — mock it for simplicity
jest.mock('../../common/ImageDropZone', () => ({
  __esModule: true,
  default: () => <div data-testid="image-dropzone" />,
}))

// uploadProjectImage pulls in @vercel/blob → undici which needs Web APIs not in jsdom
jest.mock('@/lib/project/uploadProjectImage.lib', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue('https://example.com/image.jpg'),
}))

async function openModal() {
  const user = userEvent.setup()
  renderWithProviders(<AddProjectModal />)
  // Plus button (only button present before modal opens)
  await user.click(screen.getByRole('button'))
  await screen.findByText('Add Project')
  return user
}

describe('AddProjectModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMutateAsync.mockResolvedValue({ message: 'Project created' })
  })

  it('calls mutateAsync with title and undefined imageUrl when no image selected', async () => {
    const user = await openModal()

    await user.type(screen.getByPlaceholderText(/e\.g: jira-style app/i), 'My Project')

    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1)
      expect(mockMutateAsync).toHaveBeenCalledWith({
        title: 'My Project',
        description: '',
        imageUrl: undefined,
      })
    })
  })

  it('includes description when provided', async () => {
    const user = await openModal()

    await user.type(screen.getByPlaceholderText(/e\.g: jira-style app/i), 'My Project')
    await user.type(screen.getByPlaceholderText(/\(optional\)/i), 'A cool project')

    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        title: 'My Project',
        description: 'A cool project',
        imageUrl: undefined,
      })
    })
  })

  it('does not submit when title is empty', async () => {
    const user = await openModal()

    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(mockMutateAsync).not.toHaveBeenCalled())
  })

  it('does not submit when title is shorter than 3 characters', async () => {
    const user = await openModal()

    await user.type(screen.getByPlaceholderText(/e\.g: jira-style app/i), 'ab')
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(mockMutateAsync).not.toHaveBeenCalled())
  })
})
