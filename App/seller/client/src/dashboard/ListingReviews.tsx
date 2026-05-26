import React, { useContext, useEffect, useState } from 'react'
import { Avatar, Box, CircularProgress, Divider, Rating, Stack, Typography } from '@mui/material'
import type { Review } from '../../../shared'
import { ErrorContext } from '../error/Context'
import { getReviews } from './model'

export default function ListingReviews({ itemId }: { itemId: string }) {
  const errorCtx = useContext(ErrorContext)
  const setError = errorCtx?.setError ?? (() => { /* no error provider */ })
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void getReviews(itemId, setError).then((r) => {
      setReviews(r)
      setLoading(false)
    })
  }, [itemId])

  if (loading) {
    return <CircularProgress size={24} />
  }

  if (reviews.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No reviews yet.
      </Typography>
    )
  }

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Rating value={avg} precision={0.1} readOnly size="small" />
        <Typography variant="body2" color="text.secondary">
          {avg.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </Typography>
      </Stack>
      {reviews.map((review) => (
        <Box key={review.id}>
          <Divider sx={{ mb: 1.5 }} />
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
              {review.user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" fontWeight={600}>
                  {review.user.name}
                </Typography>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.created_at).toLocaleDateString()}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {review.content}
              </Typography>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}
