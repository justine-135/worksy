import { render, screen } from '@testing-library/react'

import TabRoutesNav from './TabRoutesNav'

const mockHasPermission = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'project-1' }),
  usePathname: () => '/projects/project-1/dashboard',
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: mockHasPermission }),
}))

jest.mock('@/components/common/custom/CustomLink', () => ({
  CustomLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('TabRoutesNav', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows all tabs when user has all permissions', () => {
    mockHasPermission.mockReturnValue(true)
    render(<TabRoutesNav />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Board')).toBeInTheDocument()
    expect(screen.getByText('Members')).toBeInTheDocument()
    expect(screen.getByText('Roles and Permissions')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('hides tabs for permissions the user does not hold', () => {
    mockHasPermission.mockImplementation((perm: string) =>
      perm === 'dashboard.view' || perm === 'board.view',
    )
    render(<TabRoutesNav />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Board')).toBeInTheDocument()
    expect(screen.queryByText('Members')).not.toBeInTheDocument()
    expect(screen.queryByText('Roles and Permissions')).not.toBeInTheDocument()
  })

  it('builds correct hrefs using project id from params', () => {
    mockHasPermission.mockReturnValue(true)
    render(<TabRoutesNav />)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveAttribute('href', '/projects/project-1/dashboard')
  })
})
