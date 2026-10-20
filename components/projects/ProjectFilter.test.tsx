import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ProjectFilter from './ProjectFilter'

jest.mock('@/hooks/permission/usePermission', () => ({
  usePermission: () => ({ hasPermission: () => true, isLoadingPermission: false }),
}))

describe('ProjectFilter', () => {
  const setFilter = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('calls setFilter("all") when All is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectFilter filter="all" setFilter={setFilter} />)
    await user.click(screen.getByRole('button', { name: /^all$/i }))
    expect(setFilter).toHaveBeenCalledWith('all')
  })

  it('calls setFilter("owned") when Owned is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectFilter filter="all" setFilter={setFilter} />)
    await user.click(screen.getByRole('button', { name: /^owned$/i }))
    expect(setFilter).toHaveBeenCalledWith('owned')
  })

  it('calls setFilter("shared") when Shared is clicked', async () => {
    const user = userEvent.setup()
    render(<ProjectFilter filter="all" setFilter={setFilter} />)
    await user.click(screen.getByRole('button', { name: /^shared$/i }))
    expect(setFilter).toHaveBeenCalledWith('shared')
  })
})
