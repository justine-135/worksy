import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import SidebarNavigation from './SidebarNavigation'

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'project-1', section: 'dashboard' }),
}))

jest.mock('@/hooks/project/useGetProjects', () => ({
  useGetProjects: () => ({
    data: [
      { id: 'project-1', title: 'Alpha' },
      { id: 'project-2', title: 'Beta' },
    ],
    isLoading: false,
  }),
}))

jest.mock('./ProjectRoutes', () => ({
  __esModule: true,
  default: () => <div data-testid="project-routes" />,
}))

jest.mock('./user-menu/SidebarUserSurface', () => ({
  __esModule: true,
  default: () => <div data-testid="user-surface" />,
}))

jest.mock('@/components/common/custom/CustomLink', () => ({
  CustomLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('SidebarNavigation', () => {
  it('renders the collapse/expand toggle button', () => {
    renderWithProviders(<SidebarNavigation />)
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
  })

  it('shows recent projects when not collapsed', () => {
    renderWithProviders(<SidebarNavigation />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('hides project list after toggle button is clicked (collapsed)', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SidebarNavigation />)

    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })
})
