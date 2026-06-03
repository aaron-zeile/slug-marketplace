import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import type { ApiKeyMetadata, ApiKeyResponse } from '../../../shared'
import { ErrorContext } from '../error/Context'
import { createApiKey, listApiKeys, revokeApiKey } from './model'

const ignoreError = () => {}

export default function ApiKeys() {
  const t = useTranslations('ApiKeys')
  const errorCtx = useContext(ErrorContext)
  const setError = errorCtx?.setError ?? ignoreError
  const [name, setName] = useState('Seller dashboard key')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [revokingId, setRevokingId] = useState<string | undefined>()
  const [keys, setKeys] = useState<ApiKeyMetadata[]>([])
  const [apiKey, setApiKey] = useState<ApiKeyResponse | undefined>()
  const [copied, setCopied] = useState(false)

  const loadKeys = useCallback(async () => {
    setLoading(true)
    const loaded = await listApiKeys(setError)
    setKeys(loaded)
    setLoading(false)
  }, [setError])

  useEffect(() => {
    void loadKeys()
  }, [loadKeys])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    setSaving(true)
    setCopied(false)
    const created = await createApiKey(trimmedName, setError)
    setSaving(false)

    if (created) {
      setApiKey(created)
      await loadKeys()
    }
  }

  const copyKey = async () => {
    if (!apiKey) {
      return
    }

    await navigator.clipboard.writeText(apiKey.key)
    setCopied(true)
  }

  const revoke = async (id: string) => {
    setRevokingId(id)
    const revoked = await revokeApiKey(id, setError)
    setRevokingId(undefined)

    if (revoked) {
      setKeys((current) => current.filter((key) => key.id !== id))
    }
  }

  return (
    <Box sx={{ maxWidth: 760, p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5" component="h2">
          {t('title')}
        </Typography>

        <Alert severity="info">
          {t('oneTimeNotice')}
        </Alert>

        <Stack
          component="form"
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          onSubmit={submit}
        >
          <TextField
            label={t('nameLabel')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            inputProps={{ maxLength: 128 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={saving || name.trim().length === 0}
            sx={{ minWidth: 132 }}
          >
            {saving ? t('creating') : t('create')}
          </Button>
        </Stack>

        {apiKey && (
          <Alert
            severity="success"
            action={
              <Tooltip title={copied ? t('copied') : t('copy')}>
                <IconButton
                  color="inherit"
                  size="small"
                  aria-label={t('copy')}
                  onClick={copyKey}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            <Stack spacing={1}>
              <Typography fontWeight={700}>
                {t('created', { name: apiKey.name })}
              </Typography>
              <Typography
                component="code"
                sx={{
                  display: 'block',
                  fontFamily: 'monospace',
                  overflowWrap: 'anywhere',
                }}
              >
                {apiKey.key}
              </Typography>
              <Typography
                component="code"
                sx={{
                  display: 'block',
                  fontFamily: 'monospace',
                  overflowWrap: 'anywhere',
                }}
              >
                X-API-Key: {apiKey.key}
              </Typography>
            </Stack>
          </Alert>
        )}

        <TableContainer component={Paper} variant="outlined">
          <Table aria-label={t('tableLabel')}>
            <TableHead>
              <TableRow>
                <TableCell>{t('nameColumn')}</TableCell>
                <TableCell>{t('createdColumn')}</TableCell>
                <TableCell align="right">{t('actionsColumn')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell>
                    {new Date(key.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('revoke')}>
                      <span>
                        <IconButton
                          aria-label={t('revokeKey', { name: key.name })}
                          color="error"
                          disabled={revokingId === key.id}
                          onClick={() => void revoke(key.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && keys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary">
                      {t('empty')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary">
                      {t('loading')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Box>
  )
}
