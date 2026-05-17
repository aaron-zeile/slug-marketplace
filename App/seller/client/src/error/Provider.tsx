import React from 'react'
import { useTranslations } from 'next-intl'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import type { SnackbarCloseReason } from '@mui/material/Snackbar'
import Snackbar from '@mui/material/Snackbar'
import type { ReactNode} from "react"
import { useState, Fragment } from "react"

import { ErrorContext } from './Context.js'

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const t = useTranslations('Error')
  const [error, setError] = useState<string|undefined>(undefined)

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setError(undefined);
  }

  const action = (
    <Fragment>
      <IconButton
        size="small"
        aria-label={t('closeAria')}
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  )

  return (
    <ErrorContext.Provider value={{ error, setError}}>
      {children}
      <Snackbar
        open={error != undefined}
        autoHideDuration={6000}
        onClose={handleClose}
        message={error}
        action={action}
      />
    </ErrorContext.Provider>
  );
};