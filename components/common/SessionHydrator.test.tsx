import { render } from '@testing-library/react'

import SessionHydrator from './SessionHydrator'

const mockSetUserId = jest.fn()
const mockSetProjectId = jest.fn()
const mockFetchPermissions = jest.fn()

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      setUserId: mockSetUserId,
      setProjectId: mockSetProjectId,
      fetchPermissions: mockFetchPermissions,
    }),
}))

describe('SessionHydrator', () => {
  beforeEach(() => jest.clearAllMocks())

  it('calls setUserId on mount when userId is provided', () => {
    render(<SessionHydrator userId="user-1" />)
    expect(mockSetUserId).toHaveBeenCalledWith('user-1')
  })

  it('calls setProjectId and fetchPermissions when projectId is provided', () => {
    render(<SessionHydrator userId="user-1" projectId="project-1" />)
    expect(mockSetProjectId).toHaveBeenCalledWith('project-1')
    expect(mockFetchPermissions).toHaveBeenCalledWith('project-1', 'user-1')
  })

  it('does not call setProjectId when projectId is null', () => {
    render(<SessionHydrator userId="user-1" projectId={null} />)
    expect(mockSetProjectId).not.toHaveBeenCalled()
    expect(mockFetchPermissions).not.toHaveBeenCalled()
  })

  it('renders nothing (null component)', () => {
    const { container } = render(<SessionHydrator userId="user-1" />)
    expect(container).toBeEmptyDOMElement()
  })
})
