'use client';

import StarRounded from '@mui/icons-material/StarRounded';
import {
  Alert,
  Box,
  Button,
  Rating,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type { Review } from '../../../item/review';
import { createItemReviewAction } from './actions';

interface Props {
  itemId: string;
  onReviewCreated: (review: Review) => void;
}

export default function ReviewWriteForm({ itemId, onReviewCreated }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = comment.trim();
    const stars = rating ?? 0;

    if (stars < 1 || stars > 5) {
      setError('Please choose a star rating.');
      return;
    }
    if (trimmed.length < 1) {
      setError('Please write a short review.');
      return;
    }
    if (trimmed.length > 1024) {
      setError('Review must be at most 1024 characters.');
      return;
    }

    setSubmitting(true);
    const result = await createItemReviewAction(itemId, stars, trimmed);
    setSubmitting(false);

    if (result.success && result.data) {
      onReviewCreated(result.data);
      setRating(null);
      setComment('');
    } else {
      setError(result.error);
    }
  };

  return (
    <Box
      sx={{
        mb: 2.5,
        p: 2,
        borderRadius: 1.5,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Write a review
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      ) : null}

      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="caption"
          sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}
        >
          Your rating
        </Typography>
        <Rating
          name="new-review-rating"
          value={rating}
          onChange={(_, value) => {
            setRating(value);
          }}
          size="medium"
          emptyIcon={<StarRounded sx={{ opacity: 0.35 }} fontSize="inherit" />}
          icon={<StarRounded fontSize="inherit" />}
          sx={{ color: 'warning.main' }}
        />
      </Box>

      <TextField
        label="Comment"
        placeholder="What did you think of this item?"
        multiline
        minRows={3}
        fullWidth
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 1024 } }}
        sx={{ mb: 1.5 }}
      />

      <Button
        variant="contained"
        onClick={() => void handleSubmit()}
        disabled={submitting}
        sx={{ textTransform: 'none', fontWeight: 600 }}
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </Button>
    </Box>
  );
}
