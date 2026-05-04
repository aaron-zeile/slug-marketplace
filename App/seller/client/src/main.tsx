import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';

const rootElement = document.getElementById('root');
const theme = createTheme();

if (rootElement === null) {
  throw new Error('Root element #root was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
