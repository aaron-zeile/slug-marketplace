'use client';

import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface AdminItemSeller {
  id: string;
  name: string;
}

interface AdminItem {
  id: string;
  name: string;
  seller: AdminItemSeller;
  price: number;
  status: string;
  createdAt: string;
}

interface AdminReview {
  id: string;
  itemId: string;
  itemName: string;
  user: { id: string; name: string };
  content: string;
  rating: number;
  createdAt: string;
}

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch('/admin/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

function StarRating({ rating }: { rating: number }) {
  const stars = Math.round(rating);
  return (
    <Typography component="span" sx={{ color: '#f59e0b', letterSpacing: '-1px' }}>
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </Typography>
  );
}

function ItemReviewsRow({
  item,
  reviews,
  onDeleteReview,
  deletingId,
}: {
  item: AdminItem;
  reviews: AdminReview[];
  onDeleteReview: (reviewId: string) => void;
  deletingId: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen((o) => !o)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.seller.name}</TableCell>
        <TableCell>${Number(item.price).toFixed(2)}</TableCell>
        <TableCell>
          <Chip
            label={reviews.length === 1 ? '1 review' : `${reviews.length} reviews`}
            size="small"
            color={reviews.length > 0 ? 'primary' : 'default'}
            variant={reviews.length > 0 ? 'filled' : 'outlined'}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={5} sx={{ py: 0 }}>
          <Collapse in={open} unmountOnExit>
            <Box sx={{ mx: 2, my: 1 }}>
              {reviews.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  No reviews for this listing.
                </Typography>
              ) : (
                reviews.map((review) => (
                  <Box
                    key={review.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {review.user.name}
                        </Typography>
                        <StarRating rating={review.rating} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {review.content}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ ml: 2, flexShrink: 0 }}
                      disabled={deletingId === review.id}
                      onClick={() => onDeleteReview(review.id)}
                    >
                      {deletingId === review.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </Box>
                ))
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ReviewsPage() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [reviewsByItem, setReviewsByItem] = useState<Record<string, AdminReview[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, reviewsData] = await Promise.all([
        gql(`query { adminItems { id name price status createdAt seller { id name } } }`),
        gql(`query { adminReviews { id itemId itemName content rating createdAt user { id name } } }`),
      ]);

      const fetchedItems: AdminItem[] = itemsData.adminItems;
      const fetchedReviews: AdminReview[] = reviewsData.adminReviews;

      const grouped: Record<string, AdminReview[]> = {};
      for (const item of fetchedItems) {
        grouped[item.id] = [];
      }
      for (const review of fetchedReviews) {
        if (grouped[review.itemId]) {
          grouped[review.itemId].push(review);
        }
      }

      setItems(fetchedItems);
      setReviewsByItem(grouped);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setDeletingId(reviewId);
    try {
      await gql(`mutation($id: String!) { adminDeleteReview(id: $id) }`, { id: reviewId });
      setReviewsByItem((prev) => {
        const updated: Record<string, AdminReview[]> = {};
        for (const [itemId, reviews] of Object.entries(prev)) {
          updated[itemId] = reviews.filter((r) => r.id !== reviewId);
        }
        return updated;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const totalReviews = Object.values(reviewsByItem).reduce((sum, r) => sum + r.length, 0);

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <RateReviewIcon color="primary" fontSize="large" />
        <Typography variant="h4" fontWeight={700}>
          Reviews
        </Typography>
        {!loading && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({totalReviews} across {items.length} listings)
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography color="text.secondary">No listings found.</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={48} />
                <TableCell><strong>Listing</strong></TableCell>
                <TableCell><strong>Seller</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Reviews</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <ItemReviewsRow
                  key={item.id}
                  item={item}
                  reviews={reviewsByItem[item.id] ?? []}
                  onDeleteReview={handleDeleteReview}
                  deletingId={deletingId}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
