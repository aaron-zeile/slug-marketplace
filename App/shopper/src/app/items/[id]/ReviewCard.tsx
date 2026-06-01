'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import { Avatar, Box, IconButton, Rating, Typography } from '@mui/material';
import { useState } from 'react';
import type { Review } from '../../../item/review';
import { deleteItemReviewAction } from './actions';
import { initialsFromName } from './reviewDisplayUtils';
import ReportModal from './ReportModal';

export default function ReviewCard({
  review,
  canDelete,
  onDeleted,
}: {
  review: Review;
  canDelete: boolean;
  onDeleted: (reviewId: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const created = new Date(review.created_at).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  });

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteItemReviewAction(review.id);
    setDeleting(false);
    if (result.success) {
      onDeleted(review.id);
    }
  }

  return (
    <Box
      sx={{
        py: 1.25,
        px: 1.5,
        borderRadius: 1.5,
        bgcolor: 'grey.50',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1.5,
          alignItems: 'flex-start',
        }}
      >
        <Avatar
          alt={review.user.name}
          sx={{
            width: 36,
            height: 36,
            fontSize: '0.8125rem',
            fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {initialsFromName(review.user.name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              columnGap: 1,
              rowGap: 0.25,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.35 }}
            >
              {review.user.name}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  lineHeight: 1.2,
                }}
              >
                {created}
              </Typography>
              <IconButton
                aria-label="Report review"
                size="small"
                onClick={() => setReportOpen(true)}
                sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'warning.main' } }}
              >
                <FlagOutlinedIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
              {canDelete ? (
                <IconButton
                  aria-label="Delete review"
                  size="small"
                  color="error"
                  disabled={deleting}
                  onClick={() => void handleDelete()}
                  sx={{ p: 0.25 }}
                >
                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              ) : null}
            </Box>
          </Box>
          <Rating
            name={`rating-${review.id}`}
            value={review.rating}
            readOnly
            size="small"
            emptyIcon={
              <StarRounded sx={{ opacity: 0.35 }} fontSize="inherit" />
            }
            icon={<StarRounded fontSize="inherit" />}
            sx={{
              color: 'warning.main',
              mt: 0.25,
              '& .MuiRating-icon': { fontSize: '1rem' },
            }}
          />
          <Typography
            variant="body2"
            sx={{
              mt: 0.75,
              color: 'text.primary',
              lineHeight: 1.55,
              fontSize: '0.875rem',
            }}
          >
            {review.content}
          </Typography>
        </Box>
      </Box>
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        type="review"
        targetId={review.id}
        targetName={`Review by ${review.user.name}`}
      />
    </Box>
  );
}
