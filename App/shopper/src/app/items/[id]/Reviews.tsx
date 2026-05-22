'use client';

import {
  Box,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Review } from '../../../item/review';
import {
  fetchItemReviewSessionAction,
  fetchItemReviewsAction,
} from './actions';
import ReviewCard from './ReviewCard';
import ReviewSummary from './ReviewSummary';
import ReviewWriteForm from './ReviewWriteForm';
import { prependReview, removeReview } from './reviewDisplayUtils';

interface Props {
  id: string;
}

interface State {
  reviews: Review[] | null;
  loggedIn: boolean;
  currentUserId: string | undefined;
  loading: boolean;
  err: string;
}

const initialState: State = {
  reviews: null,
  loggedIn: false,
  currentUserId: undefined,
  loading: true,
  err: '',
};

const Reviews = ({ id }: Props) => {
  const [state, setState] = useState<State>(initialState);
  const prevId = useRef(id);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchItemReviewsAction(id),
      fetchItemReviewSessionAction(),
    ]).then(([revRes, sessRes]) => {
      if (cancelled) return;

      if (!revRes.success || revRes.data === undefined) {
        console.error('Failed to fetch reviews');
        setState({
          reviews: null,
          loggedIn: false,
          currentUserId: undefined,
          loading: false,
          err: 'Failed to fetch reviews',
        });
      } else {
        setState({
          reviews: revRes.data ?? null,
          loggedIn: sessRes.loggedIn,
          currentUserId: sessRes.userId,
          loading: false,
          err: '',
        });
      }
    });

    return () => {
      cancelled = true;
      if (prevId.current !== id) {
        prevId.current = id;
        setState(initialState);
      }
    };
  }, [id]);

  if (state.loading) {
    return (
      <Container maxWidth="md" disableGutters sx={{ py: 0 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress aria-label="Loading reviews" />
        </Paper>
      </Container>
    );
  }

  if (state.err) {
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

  const list = state.reviews ?? [];

  return (
    <Box>
      <Typography
        variant="subtitle1"
        component="h2"
        sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}
      >
        Reviews
      </Typography>

      {state.loggedIn ? (
        <ReviewWriteForm
          itemId={id}
          onReviewCreated={(review) => {
            setState((prev) => ({
              ...prev,
              reviews: prependReview(prev.reviews, review),
            }));
          }}
        />
      ) : (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Sign in with the account button in the top bar to write a review.
          </Typography>
        </Box>
      )}

      {list.length === 0 ? (
        <Box sx={{ py: 2, px: 1.5, borderRadius: 1.5, bgcolor: 'grey.50' }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {list.map((review, index) => (
              <Box
                key={review.id}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}
              >
                {index > 0 ? (
                  <Divider sx={{ alignSelf: 'stretch', width: '100%' }} />
                ) : null}
                <ReviewCard
                  review={review}
                  canDelete={
                    state.currentUserId !== undefined &&
                    review.user.id === state.currentUserId
                  }
                  onDeleted={(reviewId) => {
                    setState((prev) => ({
                      ...prev,
                      reviews: removeReview(prev.reviews, reviewId),
                    }));
                  }}
                />
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Reviews;
