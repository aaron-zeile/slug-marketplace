import React from 'react'

import { ErrorProvider } from './error/Provider'
import TopBar from './dashboard/Appbar'
import SellerListings from './dashboard/Listings'
import CreateListing from './dashboard/CreateListing'
import { TabProvider } from './dashboard/Provider'
import { useDashboard } from './dashboard/useDashboard'

import { createTheme, ThemeProvider } from '@mui/material/styles';

const navyBlue = '#003c6c'

const theme = createTheme({
  palette: {
    primary: {
      main: navyBlue,
      contrastText: '#fff',
    },
  },
});

function AppContent() {
  const { tabValue } = useDashboard()

  let content = null
  if (tabValue === 0) {
    content = <SellerListings/>
  }
  if (tabValue === 3) {
    content = <CreateListing/>
  }
  return (
    <>
      <TopBar/>
      {content}
    </>
  )
}

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorProvider>
        <TabProvider>
          <AppContent/>
        </TabProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
}
