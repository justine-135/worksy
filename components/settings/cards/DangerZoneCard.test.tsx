import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { ProjectDetailDTO } from '@/types/project.dto'

import DangerZoneCard from './DangerZoneCard'

const mockMutate = jest.fn()

jest.mock('@/hooks/project/useDeleteProject', () => ({
  useDeleteProject: () => ({ mutate: mockMutate, isPending: false }),
}))

jest.mock('@/hooks/common/useApiMessage', () => ({
  useApiMessage: () => ({ showSuccess: jest.fn(), showError: jest.fn() }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

const mockProject = { id: 'project-1', title: 'Test Project', ownerId: 'user-1' } as ProjectDetailDTO

describe('DangerZoneCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('opens confirm modal when "Delete project" button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DangerZoneCard project={mockProject} />)

    await user.click(screen.getByRole('button', { name: /delete project/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/delete "test project"/i)).toBeInTheDocument()
  })

  it('calls mutate when deletion is confirmed in the modal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DangerZoneCard project={mockProject} />)

    await user.click(screen.getByRole('button', { name: /delete project/i }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /delete project/i }))

    expect(mockMutate).toHaveBeenCalledTimes(1)
  })

  it('closes modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DangerZoneCard project={mockProject} />)

    await user.click(screen.getByRole('button', { name: /delete project/i }))
    await screen.findByRole('dialog')
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
