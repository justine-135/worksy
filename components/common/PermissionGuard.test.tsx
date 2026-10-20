import { render, screen } from '@testing-library/react'

import PermissionGuard from './PermissionGuard'

const mockUsePermission = jest.fn()

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => mockUsePermission(),
}))

describe('PermissionGuard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders nothing while permissions are loading', () => {
    mockUsePermission.mockReturnValue({ hasPermission: jest.fn(), isLoadingPermission: true })
    const { container } = render(
      <PermissionGuard permission="task.create">
        <button>Create Task</button>
      </PermissionGuard>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders fallback when user lacks the permission', () => {
    mockUsePermission.mockReturnValue({ hasPermission: () => false, isLoadingPermission: false })
    render(
      <PermissionGuard permission="task.create" fallback={<span>Not allowed</span>}>
        <button>Create Task</button>
      </PermissionGuard>,
    )
    expect(screen.getByText('Not allowed')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create Task' })).not.toBeInTheDocument()
  })

  it('renders nothing (default fallback) when permission is absent and no fallback', () => {
    mockUsePermission.mockReturnValue({ hasPermission: () => false, isLoadingPermission: false })
    const { container } = render(
      <PermissionGuard permission="task.create">
        <button>Create Task</button>
      </PermissionGuard>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders children when user has the permission', () => {
    mockUsePermission.mockReturnValue({ hasPermission: () => true, isLoadingPermission: false })
    render(
      <PermissionGuard permission="task.create">
        <button>Create Task</button>
      </PermissionGuard>,
    )
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument()
  })
})
