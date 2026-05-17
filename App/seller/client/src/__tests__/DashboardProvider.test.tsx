import {render} from '@testing-library/react'
import {expect, it} from 'vitest'
import React from 'react'

import {useDashboard} from '../dashboard/useDashboard'

function UsesDashboard() {
  useDashboard()
  return <div>dashboard hook worked</div>
}

it('throws when useDashboard is used outside DashboardProvider', () => {
  expect(() => render(<UsesDashboard />)).toThrow(
    'useDashboard must be used within TabProvider',
  )
})