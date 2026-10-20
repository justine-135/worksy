import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import { MembersTable } from './MembersTable'

const mockUseGetProjectMembers = jest.fn()

jest.mock('@/hooks/member/useGetProjectMembers', () => ({
  useGetProjectMembers: (...args: unknown[]) => mockUseGetProjectMembers(...args),
}))

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ projectId: 'project-1' }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

// Column definitions import EditMember/ViewMemberDrawer which have complex deps — mock them
jest.mock('./memberTableColumns', () => ({
  __esModule: true,
  default: () => ({
    columns: [
      { id: 'name', header: 'Name', cell: (row: { name: string }) => row.name, isRowHeader: true },
      { id: 'email', header: 'Email', cell: (row: { email: string }) => row.email },
    ],
  }),
}))

describe('MembersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetProjectMembers.mockReturnValue({
      data: {
        data: [
          {
            id: 'member-1',
            user: { id: 'user-1', name: 'Alice', email: 'alice@example.com', image: null },
            role: { id: 'role-1', name: 'Developer' },
            createdAt: '2024-01-01T00:00:00.000Z',
            status: 'ACTIVE',
          },
        ],
        count: 1,
      },
      isLoading: false,
    })
  })

  it('renders member rows from fetched data', () => {
    renderWithProviders(<MembersTable />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('renders empty state when no data is returned', () => {
    mockUseGetProjectMembers.mockReturnValue({
      data: { data: [], count: 0 },
      isLoading: false,
    })
    renderWithProviders(<MembersTable />)
    expect(screen.getByText(/no data available/i)).toBeInTheDocument()
  })
})
