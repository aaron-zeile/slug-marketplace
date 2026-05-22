import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export default function ContactAdmin() {
  const t = useTranslations('ContactAdmin')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(undefined)
    setSuccess(false)

    try {
      const res = await fetch('/seller/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      })
      if (!res.ok) throw new Error(res.statusText)
      setSuccess(true)
      setSubject('')
      setBody('')
    } catch (err: unknown) {
      setError(String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Paper elevation={0} sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        {t('title')}
      </Typography>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('success')}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label={t('subjectLabel')}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          inputProps={{ maxLength: 256 }}
        />
        <TextField
          label={t('bodyLabel')}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          multiline
          rows={5}
          inputProps={{ maxLength: 2048 }}
        />
        <Button type="submit" variant="contained" disabled={submitting} sx={{ alignSelf: 'flex-start' }}>
          {submitting ? t('submitting') : t('submit')}
        </Button>
      </Box>
    </Paper>
  )
}
