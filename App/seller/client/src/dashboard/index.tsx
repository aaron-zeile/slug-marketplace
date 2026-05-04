import React from 'react'
import TopBar from './Appbar';

import { createTheme, ThemeProvider, getContrastRatio } from '@mui/material/styles';

const navyBlue = '#003c6c'

const theme = createTheme({
  palette: {
    primary: {
      main: navyBlue,
      contrastText: getContrastRatio(navyBlue, '#fff') > 4.5 ? '#fff' : '#111',
    },
  },
});

export default function Dashboard() {
  return (
    <ThemeProvider theme={theme}>
      <TopBar/>
    </ThemeProvider>
  )
}
