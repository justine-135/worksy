import { render, screen } from '@testing-library/react'

import PermissionGate from './PermissionGate'

const mockUsePermission = jest.fn()

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => mockUsePermission(),
}))

describe('PermissionGate', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders skeleton while permissions are loading', () => {
    mockUsePermission.mockReturnValue({ hasPermission: jest.fn(), isLoadingPermission: true })
    render(
      <PermissionGate permission="task.view" skeleton={<div data-testid="skeleton" />}>
        <div data-testid="content" />
      </PermissionGate>,
    )
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('renders "No permission" when user lacks the permission', () => {
    mockUsePermission.mockReturnValue({ hasPermission: () => false, isLoadingPermission: false })
    render(
      <PermissionGate permission="task.view" skeleton={<div />}>
        <div data-testid="content" />
      </PermissionGate>,
    )
    expect(screen.getByText('No permission')).toBeInTheDocument()
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
  })

  it('renders children when user has the permission', () => {
    mockUsePermission.mockReturnValue({ hasPermission: () => true, isLoadingPermission: false })
    render(
      <PermissionGate permission="task.view" skeleton={<div />}>
        <div data-testid="content">Accessible content</div>
      </PermissionGate>,
    )
    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.queryByText('No permission')).not.toBeInTheDocument()
  })
})
