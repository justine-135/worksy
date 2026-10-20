import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import RoleForm from './RoleForm'

jest.mock('@heroui/react/toast', () => ({
  toast: Object.assign(jest.fn(), { danger: jest.fn(), success: jest.fn() }),
}))

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

describe('RoleForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('calls onSubmit with name and permissions when form is valid', async () => {
    const user = userEvent.setup()
    render(<RoleForm onSubmit={mockOnSubmit} isPending={false} />)

    await user.type(
      screen.getByPlaceholderText(/enter role name/i),
      'Developer',
    )

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          name: 'Developer',
          permissions: expect.arrayContaining([expect.any(String)]),
        },
        expect.anything(), // react-hook-form passes the submit event as 2nd arg
      )
    })
  })

  it('does not submit when name is missing', async () => {
    const user = userEvent.setup()
    render(<RoleForm onSubmit={mockOnSubmit} isPending={false} />)

    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled())
  })

  it('does not submit when name is shorter than 3 characters', async () => {
    const user = userEvent.setup()
    render(<RoleForm onSubmit={mockOnSubmit} isPending={false} />)

    await user.type(screen.getByPlaceholderText(/enter role name/i), 'ab')
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled())
  })

  it('does not submit when no permissions are selected', async () => {
    const user = userEvent.setup()
    render(<RoleForm onSubmit={mockOnSubmit} isPending={false} />)

    await user.type(screen.getByPlaceholderText(/enter role name/i), 'Developer')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(mockOnSubmit).not.toHaveBeenCalled())
  })

  it('pre-fills form with initialValues and shows "Save Changes"', () => {
    render(
      <RoleForm
        onSubmit={mockOnSubmit}
        isPending={false}
        initialValues={{ id: 'role-1', name: 'Editor', permissions: ['board.view'] }}
      />,
    )

    expect(screen.getByDisplayValue('Editor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
