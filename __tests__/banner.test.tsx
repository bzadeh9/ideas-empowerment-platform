import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Banner } from '@/components/banner'

describe('Banner', () => {
  it('renders when defaultOpen is true', () => {
    render(<Banner defaultOpen={true} onDismiss={() => {}} />)
    expect(
      screen.getByText('Ideas Empowerment Platform demo')
    ).toBeInTheDocument()
  })

  it('does not render when defaultOpen is false', () => {
    render(<Banner defaultOpen={false} onDismiss={() => {}} />)
    expect(
      screen.queryByText('Ideas Empowerment Platform demo')
    ).not.toBeInTheDocument()
  })

  it('calls onDismiss and hides when close button is clicked', () => {
    const onDismiss = vi.fn()
    render(<Banner defaultOpen={true} onDismiss={onDismiss} />)

    const closeButton = screen.getByRole('button', { name: /close banner/i })
    fireEvent.click(closeButton)

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByText('Ideas Empowerment Platform demo')
    ).not.toBeInTheDocument()
  })

  it('has proper accessibility on the close button', () => {
    render(<Banner defaultOpen={true} onDismiss={() => {}} />)
    const closeButton = screen.getByRole('button', { name: /close banner/i })
    expect(closeButton).toBeInTheDocument()
  })
})
