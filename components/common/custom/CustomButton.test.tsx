import { render, screen } from '@testing-library/react'

import CustomButton from './CustomButton'

const mockUsePermission = jest.fn()

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => mockUsePermission(),
}))

describe('CustomButton', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders button when no permission prop is set', () => {
    mockUsePermission.mockReturnValue({ hasPermission: () => false, isLoadingPermission: false })
    render(<CustomButton title="Save" />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('renders button when user holds the required permission', () => {
    mockUsePermission.mockReturnValue({ hasPermission: () => true, isLoadingPermission: false })
    render(<CustomButton title="Delete" permission="task.delete" />)
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('renders nothing while permissions are still loading (permission prop set)', () => {
    mockUsePermission.mockReturnValue({ hasPermission: () => false, isLoadingPermission: true })
    const { container } = render(<CustomButton title="Delete" permission="task.delete" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when user lacks the required permission', () => {
    mockUsePermission.mockReturnValue({ hasPermission: () => false, isLoadingPermission: false })
    const { container } = render(<CustomButton title="Delete" permission="task.delete" />)
    expect(container).toBeEmptyDOMElement()
  })
})
