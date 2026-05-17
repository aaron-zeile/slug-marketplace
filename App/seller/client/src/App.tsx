import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'

import { ErrorProvider } from './error/Provider'
import TopBar from './dashboard/Appbar'
import SellerListings from './dashboard/Listings'
import CreateListing from './dashboard/CreateListing'
import { TabProvider } from './dashboard/Provider'
import { useDashboard } from './dashboard/useDashboard'
import AppProviders from './providers/AppProviders'

function TabPlaceholder({ messageKey }: { messageKey: 'sales' | 'feedback' }) {
  const t = useTranslations('Placeholders')
  return (
    <Box sx={{ p: 3 }}>
      <Typography color="text.secondary">{t(messageKey)}</Typography>
    </Box>
  )
}

export function AppContent() {
  const { tabValue } = useDashboard()

  let content = null
  if (tabValue === 0) {
    content = <SellerListings />
  }
  if (tabValue === 1) {
    content = <TabPlaceholder messageKey="sales" />
  }
  if (tabValue === 2) {
    content = <TabPlaceholder messageKey="feedback" />
  }
  if (tabValue === 3) {
    content = <CreateListing />
  }
  return (
    <>
      <TopBar />
      {content}
    </>
  )
}

export function App() {
  return (
    <AppProviders>
      <ErrorProvider>
        <TabProvider>
          <AppContent />
        </TabProvider>
      </ErrorProvider>
    </AppProviders>
  );
}
