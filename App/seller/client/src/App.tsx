import React from 'react'
import BoltIcon from '@mui/icons-material/Bolt';

import { ErrorProvider } from './error/Provider'
import Dashboard from './dashboard';

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

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorProvider>
        <Dashboard/>
      </ErrorProvider>
    </ThemeProvider>
  );
}
