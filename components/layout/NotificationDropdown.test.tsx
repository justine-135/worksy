import { screen } from '@testing-library/react'

import { NotificationType } from '@/enum/notifications.enum'
import { renderWithProviders } from '@/tests/helpers/renderWithProviders'
import { NotificationDataDTO } from '@/types/notification.dto'

import { NotificationDropdown } from './NotificationDropdown'

const mockReadMutate = jest.fn()
const mockUseGetNotification = jest.fn()

jest.mock('@/hooks/notification/useGetNotification', () => ({
  useGetNotification: (...args: unknown[]) => mockUseGetNotification(...args),
}))

jest.mock('@/hooks/notification/useReadNotification', () => ({
  __esModule: true,
  default: () => ({ mutation: { mutate: mockReadMutate, isPending: false } }),
}))

const mockInviteNotification: NotificationDataDTO = {
  id: 'notif-1',
  title: 'invited you to',
  read: false,
  readAt: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  type: NotificationType.INVITE,
  data: {
    projectTitle: 'Cool Project',
    user: { name: 'Alice', email: 'alice@example.com', image: null },
  },
}

describe('NotificationDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetNotification.mockReturnValue({ data: undefined })
  })

  it('shows unread count badge when there are unread notifications', () => {
    mockUseGetNotification.mockReturnValue({
      data: { data: [mockInviteNotification], unreadCount: 1 },
    })
    renderWithProviders(
      <NotificationDropdown collapsed={false} collapsedButtonClassName="" />,
    )
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('does not show badge when all notifications are read', () => {
    mockUseGetNotification.mockReturnValue({
      data: { data: [], unreadCount: 0 },
    })
    renderWithProviders(
      <NotificationDropdown collapsed={false} collapsedButtonClassName="" />,
    )
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('renders Notification button', () => {
    renderWithProviders(
      <NotificationDropdown collapsed={false} collapsedButtonClassName="" />,
    )
    expect(screen.getByRole('button', { name: /notification/i })).toBeInTheDocument()
  })
})
