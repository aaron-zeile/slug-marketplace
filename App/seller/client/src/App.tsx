import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AuthGuard from './auth/AuthGaurd'
import { ErrorProvider } from './error/Provider'
import TopBar from './dashboard/Appbar'
import SellerListings from './dashboard/Listings'
import CreateListing from './dashboard/CreateListing'
import ContactAdmin from './dashboard/ContactAdmin'
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
  if (tabValue === 4) {
    content = <ContactAdmin />
  }
  return (
    <>
      <TopBar />
      {content}
    </>
  )
}

const routerBasename =
  import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export function App() {
  return (
    <AppProviders>
      <BrowserRouter basename={routerBasename}>
        <ErrorProvider>
          <Routes>
            <Route element={<AuthGuard />}>
              <Route
                path="*"
                element={
                  <TabProvider>
                    <AppContent />
                  </TabProvider>
                }
              />
            </Route>
          </Routes>
        </ErrorProvider>
      </BrowserRouter>
    </AppProviders>
  );
}
