import React from 'react'
import BoltIcon from '@mui/icons-material/Bolt';

import { ErrorProvider } from './error/Provider'
import Dashboard from './dashboard';

export function App() {
  return (
    <ErrorProvider>
      <Dashboard/>
    </ErrorProvider>
  );
}
