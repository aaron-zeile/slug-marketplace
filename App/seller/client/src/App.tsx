import React from 'react'
import BoltIcon from '@mui/icons-material/Bolt';
import {
  Paper,
  Stack,
} from '@mui/material'

import { ErrorProvider } from './error/Provider'
import Dashboard from './dashboard';

export function App() {
  return (
    <ErrorProvider>
      <Paper elevation={0} sx={{ p: { xs: 1, md: 2 } }}>
        <Stack spacing={2}>
          <Dashboard/>
        </Stack>
      </Paper>
    </ErrorProvider>
  );
}
