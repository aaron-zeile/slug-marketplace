'use client';

import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Review } from '../../../item/review';
import { fetchItemReviewsAction } from './actions';
import ReviewCard from './ReviewCard';
import ReviewSummary from './ReviewSummary';

interface Props {
  id: string;
}

const Reviews = ({ id }: Props) => {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchItemReviewsAction(id).then((result) => {
      setLoading(true);
      setErr('');
      setReviews(null);
      if (result.success && result.data !== undefined) {
        setReviews(result.data);
        setErr('');
      } else {
        setErr('Failed to fetch reviews');
        console.error('Failed to fetch reviews');
      }
      setLoading(false);
    });

    return () => {};
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" disableGutters sx={{ py: 0 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress aria-label="Loading reviews" />
        </Paper>
      </Container>
    );
  }

  if (err) {
    return (
      <Container maxWidth="md" disableGutters sx={{ py: 0 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            Failed to fetch reviews
          </Typography>
        </Paper>
      </Container>
    );
  }

  const list = reviews as Review[];

  return (
    <Box>
      <Typography
        variant="subtitle1"
        component="h2"
        sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
      >
        Reviews
      </Typography>

      {list.length === 0 ? (
        <Box
          sx={{
            py: 2,
            px: 1.5,
            borderRadius: 1.5,
            bgcolor: 'grey.50',
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
          >
            No reviews yet.
          </Typography>
        </Box>
      ) : (
        <>
          <ReviewSummary reviews={list} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            {list.map((review, index) => (
              <Box
                key={review.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                }}
              >
                {index > 0 ? (
                  <Divider sx={{ alignSelf: 'stretch', width: '100%' }} />
                ) : null}
                <ReviewCard review={review} />
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Reviews;
