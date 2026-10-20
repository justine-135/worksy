import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import RolesTable from './RolesTable'

const mockUseGetRoles = jest.fn()

jest.mock('@/hooks/role/useGetRoles', () => ({
  useGetRoles: (...args: unknown[]) => mockUseGetRoles(...args),
}))

jest.mock('@/store/session.store', () => ({
  useSessionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ projectId: 'project-1' }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

// Column definitions import AddRoleDrawer/EditRoleDrawer — mock to keep tests lean
jest.mock('./rolesTableColumns', () => ({
  __esModule: true,
  default: () => ({
    columns: [
      { id: 'name', header: 'Name', cell: (row: { name: string }) => row.name, isRowHeader: true },
    ],
  }),
}))

describe('RolesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetRoles.mockReturnValue({
      data: {
        data: [
          {
            id: 'role-1',
            name: 'Developer',
            createdAt: '2024-01-01T00:00:00.000Z',
            permissions: ['task.create', 'task.view'],
          },
        ],
        count: 1,
      },
      isLoading: false,
    })
  })

  it('renders role rows from fetched data', () => {
    renderWithProviders(<RolesTable />)
    expect(screen.getByText('Developer')).toBeInTheDocument()
  })

  it('renders empty state when no roles are returned', () => {
    mockUseGetRoles.mockReturnValue({
      data: { data: [], count: 0 },
      isLoading: false,
    })
    renderWithProviders(<RolesTable />)
    expect(screen.getByText(/no data available/i)).toBeInTheDocument()
  })
})
