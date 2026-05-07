import React from 'react'
import { DashboardProvider } from './Provider';
import TopBar from './Appbar'
// import Box from '@mui/material/Box';
import SellerListings from './Listings';

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

export default function Dashboard() {
  return (
    <ThemeProvider theme={theme}>
      <DashboardProvider>
        <TopBar/>
        {/* <Box sx={{pt: 14}}> */}
        <SellerListings/>
        {/* </Box> */}
      </DashboardProvider>
    </ThemeProvider>
  )
}
