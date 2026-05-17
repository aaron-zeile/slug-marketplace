import React from 'react'

import { TabProvider } from './Provider'
import TopBar from './Appbar'
import AppProviders from '../providers/AppProviders'
import { ErrorProvider } from '../error/Provider'

export default function Dashboard() {
  return (
    <AppProviders>
      <ErrorProvider>
        <TabProvider>
          <TopBar />
        </TabProvider>
      </ErrorProvider>
    </AppProviders>
  )
}
