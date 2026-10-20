import { render, screen } from '@testing-library/react'

import SectionComponent from './SectionComponent'

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

jest.mock('@/components/board/BoardComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="board-component" />,
}))

jest.mock('@/components/dashboard/DashboardComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard-component" />,
}))

jest.mock('@/components/members/MembersComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="members-component" />,
}))

jest.mock('@/components/roles/RolesComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="roles-component" />,
}))

const { useParams } = jest.requireMock('next/navigation') as { useParams: jest.Mock }

describe('SectionComponent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders DashboardComponent for "dashboard" section', () => {
    useParams.mockReturnValue({ section: 'dashboard' })
    render(<SectionComponent />)
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument()
  })

  it('renders BoardComponent for "board" section', () => {
    useParams.mockReturnValue({ section: 'board' })
    render(<SectionComponent />)
    expect(screen.getByTestId('board-component')).toBeInTheDocument()
  })

  it('renders MembersComponent for "members" section', () => {
    useParams.mockReturnValue({ section: 'members' })
    render(<SectionComponent />)
    expect(screen.getByTestId('members-component')).toBeInTheDocument()
  })

  it('shows 404 message for unknown section', () => {
    useParams.mockReturnValue({ section: 'unknown' })
    render(<SectionComponent />)
    expect(screen.getByText(/404.*section not found/i)).toBeInTheDocument()
  })
})
