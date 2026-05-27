import {fireEvent, screen, waitFor} from '@testing-library/react'
import React from 'react'
import {describe, expect, it} from 'vitest'

import TopBar from '../dashboard/Appbar'
import {renderWithProviders} from '../test/renderWithProviders'

describe('TopBar', () => {
  it('opens and closes the account menu from the avatar button', async () => {
    renderWithProviders(<TopBar />)

    const menuButton = screen.getByRole('button', {name: 'Open menu'})

    expect({
      expanded: menuButton.getAttribute('aria-expanded'),
      controls: menuButton.getAttribute('aria-controls'),
      menuItemVisible: screen.queryByText('Slug Marketplace') !== null,
    }).toEqual({
      expanded: 'false',
      controls: null,
      menuItemVisible: false,
    })

    fireEvent.click(menuButton)

    await screen.findByText('Slug Marketplace')
    expect({
      expanded: menuButton.getAttribute('aria-expanded'),
      controls: menuButton.getAttribute('aria-controls'),
    }).toEqual({
      expanded: 'true',
      controls: 'account-menu',
    })

    fireEvent.click(menuButton)

    await waitFor(() => {
      if (menuButton.getAttribute('aria-expanded') !== 'false') {
        throw new Error('Expected account menu button to collapse')
      }
    })
    expect({
      expanded: menuButton.getAttribute('aria-expanded'),
      controls: menuButton.getAttribute('aria-controls'),
    }).toEqual({
      expanded: 'false',
      controls: null,
    })
  })
})
