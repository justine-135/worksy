import { render, screen } from '@testing-library/react'

import SettingsNav from './SettingsNav'

const mockHasPermission = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'project-1' }),
  usePathname: () => '/projects/project-1/settings/project',
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: mockHasPermission }),
}))

describe('SettingsNav', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows all tabs when user has all permissions', () => {
    mockHasPermission.mockReturnValue(true)
    render(<SettingsNav />)
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('hides Project tab when user lacks SettingsProjectView', () => {
    mockHasPermission.mockReturnValue(false)
    render(<SettingsNav />)
    expect(screen.queryByText('Project')).not.toBeInTheDocument()
    // Appearance and Profile have no permission requirement
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })
})
