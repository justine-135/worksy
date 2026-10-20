import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SignInComponent from './SignInComponent'

const mockSignIn = jest.fn()

jest.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}))

jest.mock('@/components/common/LinesBg', () => ({
  __esModule: true,
  default: () => null,
}))

jest.mock('@/components/landing/Logo', () => ({
  Logo: () => <div data-testid="logo" />,
}))

describe('SignInComponent', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders Google and GitHub sign-in buttons', () => {
    render(<SignInComponent />)
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument()
  })

  it('calls signIn with "google" when Google button is clicked', async () => {
    const user = userEvent.setup()
    render(<SignInComponent />)
    await user.click(screen.getByRole('button', { name: /continue with google/i }))
    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/projects' })
  })

  it('calls signIn with "github" when GitHub button is clicked', async () => {
    const user = userEvent.setup()
    render(<SignInComponent />)
    await user.click(screen.getByRole('button', { name: /continue with github/i }))
    expect(mockSignIn).toHaveBeenCalledWith('github', { callbackUrl: '/projects' })
  })
})
