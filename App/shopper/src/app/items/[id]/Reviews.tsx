'use client';
import { Box, CircularProgress, Container, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { Review } from '../../../item/review';
import { fetchItemReviewsAction } from './actions';
import { set } from 'zod';

interface Props {
  id: string;
}

const Reviews = ({ id }: Props) => {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchItemReviewsAction(id).then((result) => {
      setErr('');
      if (result.success && result.data) {
        setReviews(result.data);
      } else {
        setErr('Failed to fetch reviews');
        console.error('Failed to fetch reviews');
      }
      setLoading(false);
    });
  }, [id]);

  if (loading || !reviews) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  if (err) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {err}
        </Paper>
      </Container>
    );
  }

  return (
    <Box>
      {reviews.map((review) => (
        <Box key={review.id}>
          <p>{review.user.name}</p>
          <p>{review.content}</p>
        </Box>
      ))}
    </Box>
  );
};

export default Reviews;
