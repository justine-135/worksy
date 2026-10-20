import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ETaskPriority } from '@/enum/taskPriority.enum'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { ProjectDetailDTO } from '@/types/project.dto'

import ProjectCard from './ProjectCard'

const mockMutateAsync = jest.fn()

jest.mock('@/hooks/project/useUpdateProjectSettings', () => ({
  useUpdateProjectSettings: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

jest.mock('@/hooks/common/useApiMessage', () => ({
  useApiMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

const mockProject: ProjectDetailDTO = {
  id: 'project-1',
  title: 'My Project',
  description: 'A test description',
  defaultTaskPriority: ETaskPriority.MEDIUM,
  imageUrl: null,
  ownerId: 'user-1',
}

describe('ProjectCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the project title input', () => {
    renderWithProviders(<ProjectCard project={mockProject} isOwner={true} />)
    // React Aria TextField controls the input value, so we find by placeholder
    expect(screen.getByPlaceholderText('Project name')).toBeInTheDocument()
  })

  it('calls mutateAsync with the typed title when form is submitted', async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValue({})
    renderWithProviders(<ProjectCard project={mockProject} isOwner={true} />)

    const titleInput = screen.getByPlaceholderText('Project name')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated Project')
    await user.click(screen.getByRole('button', { name: /save project/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Project' }),
      )
    })
  })

  it('does not submit when title is shorter than 3 characters', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProjectCard project={mockProject} isOwner={true} />)

    const titleInput = screen.getByPlaceholderText('Project name')
    await user.clear(titleInput)
    await user.type(titleInput, 'ab')
    await user.click(screen.getByRole('button', { name: /save project/i }))

    await waitFor(() => expect(mockMutateAsync).not.toHaveBeenCalled())
  })

  it('does not show save button when user is not owner', () => {
    renderWithProviders(<ProjectCard project={mockProject} isOwner={false} />)
    expect(screen.queryByRole('button', { name: /save project/i })).not.toBeInTheDocument()
  })
})
