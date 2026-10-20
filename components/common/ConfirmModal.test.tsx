import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/helpers/renderWithProviders'

import ConfirmModal from './ConfirmModal'

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

const defaultProps = {
  onOpenChange: jest.fn(),
  onConfirm: jest.fn(),
  title: 'Delete item?',
  description: 'This action cannot be undone.',
}

describe('ConfirmModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders title and description when open', async () => {
    renderWithProviders(<ConfirmModal {...defaultProps} isOpen />)
    expect(await screen.findByText('Delete item?')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('does not show dialog content when closed', () => {
    renderWithProviders(<ConfirmModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = jest.fn()
    renderWithProviders(<ConfirmModal {...defaultProps} isOpen onConfirm={onConfirm} />)
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /delete/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    renderWithProviders(<ConfirmModal {...defaultProps} isOpen onOpenChange={onOpenChange} />)
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
