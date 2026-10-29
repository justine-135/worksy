import { render } from '@testing-library/react'

import { ProjectToast } from './ProjectToast'

// All jest.fn() instances created inside the factory — no outer variable reference at factory time
jest.mock('@heroui/react/toast', () => ({
  toast: Object.assign(jest.fn(), { danger: jest.fn(), success: jest.fn() }),
}))

const mockGetSearchParam = jest.fn()

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: mockGetSearchParam }),
}))

describe('ProjectToast', () => {
  // Retrieve the mocked danger fn after the module registry is set up
  const getToastDanger = () =>
    (jest.requireMock('@heroui/react/toast').toast as jest.Mock & { danger: jest.Mock }).danger

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetSearchParam.mockReturnValue(null)
  })

  it('renders nothing (null component)', () => {
    const { container } = render(<ProjectToast />)
    expect(container).toBeEmptyDOMElement()
  })

  it('calls toast.danger when toast=1', () => {
    mockGetSearchParam.mockImplementation((key: string) => {
      if (key === 'toast') return '1'
      if (key === 'msg') return 'Project not found'
      return null
    })
    render(<ProjectToast />)
    expect(getToastDanger()).toHaveBeenCalledWith('Project not found')
  })

  it('does not call toast when toast param is absent', () => {
    mockGetSearchParam.mockReturnValue(null)
    render(<ProjectToast />)
    expect(getToastDanger()).not.toHaveBeenCalled()
  })
})
