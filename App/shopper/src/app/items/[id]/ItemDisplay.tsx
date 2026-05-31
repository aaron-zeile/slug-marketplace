'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import StarRounded from '@mui/icons-material/StarRounded';
import {
  Divider,
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Collapse,
  Chip,
  Rating,
  Alert,
  Snackbar,
} from '@mui/material';
import { Item } from '../../../item';
import { fetchItemAction, fetchItemReviewsAction } from './actions';
import { dispatchCartUpdated } from '../../../cart/events';
import { dispatchWishlistUpdated } from '../../../wishlist/events';
import { addCartItemAction } from '../../cart/actions';
import { addWishlistItemAction } from '../../wishlist/actions';
import Reviews from './Reviews';

interface Props {
  id: string;
}

const clipShellSx = {
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden',
} as const;

const priceUnitSx = {
  fontSize: { xs: '2rem', sm: '2.25rem' },
  fontWeight: 800,
  letterSpacing: '-0.04em',
  fontVariantNumeric: 'tabular-nums' as const,
  lineHeight: 1.05,
  color: 'text.primary',
} as const;

function localeTagForNumbers(locale: string): string {
  if (locale.startsWith('fr')) {
    return 'fr-FR';
  }
  return 'en-US';
}

function formatPriceParts(price: number, locale: string) {
  const localeTag = localeTagForNumbers(locale);
  const parts = new Intl.NumberFormat(localeTag, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(price);

  const dollars = parts
    .filter((part) => part.type === 'integer' || part.type === 'group')
    .map((part) => part.value)
    .join('');
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const cents = parts.find((part) => part.type === 'fraction')?.value ?? '00';
  const ariaLabel = new Intl.NumberFormat(localeTag, {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  return { dollars, decimal, cents, ariaLabel };
}

const itemStatusDisplay = {
  active: {
    label: 'In stock',
    chipSx: {
      bgcolor: 'success.main',
      color: 'success.contrastText',
    },
  },
  sold: {
    label: 'Sold',
    chipSx: {
      bgcolor: 'grey.400',
      color: 'grey.900',
    },
  },
} as const;

const ItemDisplay = ({ id }: Props) => {
  const router = useRouter();
  const locale = useLocale();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const [mainImage, setMainImage] = useState<string>('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [reviewSummaryPayload, setReviewSummaryPayload] = useState<{
    itemId: string;
    average: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    fetchItemReviewsAction(id).then((result) => {
      if (
        !result.success ||
        result.data === undefined ||
        result.data.length === 0
      ) {
        setReviewSummaryPayload(null);
        return;
      }
      const sum = result.data.reduce((acc, r) => acc + r.rating, 0);
      const average = sum / result.data.length;
      setReviewSummaryPayload({
        itemId: id,
        average,
        count: result.data.length,
      });
    });
    return () => {};
  }, [id]);

  const reviewSummary =
    reviewSummaryPayload !== null && reviewSummaryPayload.itemId === id
      ? {
          average: reviewSummaryPayload.average,
          count: reviewSummaryPayload.count,
        }
      : null;

  useEffect(() => {
    fetchItemAction(id).then((result) => {
      if (result.success && result.data) {
        setItem(result.data);
        setMainImage(result.data.images[0]);
      } else {
        router.push('/');
      }
      setLoading(false);
    });
  }, [id, router]);

  if (loading || !item) {
    return (
      <Box sx={clipShellSx}>
        <Box
          component="main"
          sx={{
            width: '100%',
            maxWidth: 'min(100%, 900px)',
            minWidth: 0,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            mx: 'auto',
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 4 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: '100%',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              p: 5,
              textAlign: 'center',
            }}
          >
            <CircularProgress sx={{ width: 32, height: 32 }} />
          </Paper>
        </Box>
      </Box>
    );
  }

  const handleMainImageChange = (image: string) => {
    setMainImage(image);
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const result = await addCartItemAction(item.id);

    if (result.success) {
      setCartMessage('Added to cart.');
      dispatchCartUpdated();
    } else {
      setCartMessage('Please sign in to add to cart.');
    }

    setAddingToCart(false);
  };

  const handleAddToWishlist = async () => {
    setAddingToWishlist(true);
    const result = await addWishlistItemAction(item.id);

    if (result.success) {
      setCartMessage('Added to wishlist.');
      dispatchWishlistUpdated();
    } else {
      setCartMessage('Please sign in to add to wishlist.');
    }

    setAddingToWishlist(false);
  };

  const { dollars: priceDollars, decimal: priceDecimal, cents: priceCents, ariaLabel: priceAriaLabel } =
    formatPriceParts(item.price, locale);
  const displayStatus =
    item.quantity <= 0 || item.status === 'sold' ? 'sold' : 'active';
  const statusInfo = itemStatusDisplay[displayStatus];
  const isInStock = displayStatus === 'active';

  return (
    <Box sx={clipShellSx}>
      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: 'min(100%, 900px)',
          minWidth: 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 4 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: '100%',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: '0 10px 48px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                pt: { xs: 2, sm: 2.5 },
                pb: 1.5,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  height: { xs: 'min(38vh, 340px)', sm: 'min(46vh, 460px)' },
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.50',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Image
                  key={mainImage}
                  src={mainImage}
                  fill
                  alt="thumbnail"
                  sizes="(max-width: 900px) 90vw, 852px"
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Box
                sx={{
                  mt: 1.5,
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  gap: 1.25,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  py: 1,
                  px: 0.25,
                  scrollSnapType: 'x mandatory',
                  scrollPaddingLeft: 0.25,
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': { height: 6 },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: 3,
                    bgcolor: 'action.disabledBackground',
                  },
                  maxWidth: '100%',
                  minWidth: 0,
                }}
              >
                {item.images.map((image: string) => (
                  <Box
                    key={image}
                    onClick={() => handleMainImageChange(image)}
                    sx={{
                      position: 'relative',
                      width: 88,
                      height: 88,
                      flex: '0 0 auto',
                      scrollSnapAlign: 'start',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: 2,
                      borderColor:
                        image === mainImage ? 'primary.main' : 'divider',
                      boxShadow: image === mainImage ? 2 : 0,
                      opacity: image === mainImage ? 1 : 0.9,
                      transition:
                        'opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
                      '&:hover': {
                        opacity: 1,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Image
                      src={image}
                      fill
                      alt="thumbnail"
                      sizes="88px"
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box
              sx={{
                px: { xs: 2.5, sm: 4 },
                pt: { xs: 2.5, sm: 3 },
                pb: 2,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 600,
                  fontSize: {
                    xs: 'clamp(1.45rem, 3.5vw + 0.65rem, 1.875rem)',
                    sm: '1.875rem',
                  },
                  letterSpacing: '-0.03em',
                  lineHeight: 1.14,
                  color: 'text.primary',
                  mx: 'auto',
                  maxWidth: 'min(100%, 34rem)',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  textWrap: 'balance',
                  WebkitFontSmoothing: 'antialiased',
                  textRendering: 'optimizeLegibility',
                }}
              >
                {item.name}
              </Typography>
              {reviewSummary && (
                <Box
                  role="status"
                  aria-label={`Average ${(Math.round(reviewSummary.average * 10) / 10).toFixed(1)} stars, ${reviewSummary.count} ${reviewSummary.count === 1 ? 'review' : 'reviews'}`}
                  sx={{
                    mt: 1.25,
                    mx: 'auto',
                    maxWidth: 'min(100%, 40rem)',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{ fontWeight: 700, color: 'text.primary' }}
                  >
                    {(Math.round(reviewSummary.average * 10) / 10).toFixed(1)}
                  </Typography>
                  <Rating
                    name="listing-average-rating"
                    value={reviewSummary.average}
                    max={5}
                    precision={0.1}
                    readOnly
                    size="small"
                    emptyIcon={
                      <StarRounded sx={{ opacity: 0.35 }} fontSize="inherit" />
                    }
                    icon={<StarRounded fontSize="inherit" />}
                    sx={{ color: 'warning.main' }}
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {reviewSummary.count}{' '}
                    {reviewSummary.count === 1 ? 'review' : 'reviews'}
                  </Typography>
                </Box>
              )}
              <Typography
                variant="body1"
                sx={{
                  mt: 2.25,
                  mx: 'auto',
                  maxWidth: 'min(100%, 40rem)',
                  lineHeight: 1.65,
                  color: 'text.secondary',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {item.description}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}
              >
                <Box
                  component="span"
                  sx={{ fontWeight: 600, color: 'text.primary' }}
                >
                  Seller: {item.seller.name}
                </Box>
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'divider' }} />

            <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    minWidth: 0,
                    maxWidth: '100%',
                  }}
                >
                  <Box
                    component="div"
                    role="group"
                    aria-label={priceAriaLabel}
                    sx={{
                      m: 0,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'baseline',
                      flexWrap: 'nowrap',
                      gap: 0,
                      minWidth: 0,
                    }}
                  >
                    <Typography component="span" sx={priceUnitSx}>
                      $
                    </Typography>
                    <Typography component="span" sx={priceUnitSx}>
                      {priceDollars}
                    </Typography>
                    <Typography component="span" sx={priceUnitSx}>
                      {priceDecimal}{priceCents}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 1.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: 'text.secondary' }}
                    >
                      Qty {item.quantity}
                    </Typography>
                    <Chip
                      aria-label={statusInfo.label}
                      label={statusInfo.label}
                      sx={{
                        fontWeight: 600,
                        height: 28,
                        fontSize: '0.75rem',
                        ...statusInfo.chipSx,
                        '& .MuiChip-label': { px: 1.5 },
                      }}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1.5,
                    minWidth: 0,
                    maxWidth: '100%',
                  }}
                >
                  <Button
                    aria-label={`add ${item.name} to cart`}
                    disabled={addingToCart || !isInStock}
                    onClick={handleAddToCart}
                    variant="contained"
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      flex: { sm: 1 },
                      minWidth: { sm: 0 },
                      py: 1.25,
                      px: 2,
                      minHeight: 48,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                  >
                    Add to cart
                  </Button>
                  <Button
                    aria-label={`add ${item.name} to wishlist`}
                    disabled={addingToWishlist}
                    onClick={handleAddToWishlist}
                    variant="contained"
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      flex: { sm: 1 },
                      minWidth: { sm: 0 },
                      py: 1.25,
                      px: 2,
                      minHeight: 48,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                    }}
                  >
                    Add to wishlist
                  </Button>
                </Box>

                <Box
                  sx={{
                    width: '100%',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box
                    role="button"
                    onClick={() => setDetailsOpen((open) => !open)}
                    aria-expanded={detailsOpen}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      px: 1.75,
                      py: 1.35,
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderBottom: detailsOpen ? 1 : 0,
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      Details
                    </Typography>
                    <KeyboardArrowDown
                      sx={{
                        color: 'action.active',
                        flexShrink: 0,
                        transition: 'transform 0.2s ease',
                        transform: detailsOpen
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      }}
                      aria-hidden
                    />
                  </Box>
                  <Collapse in={detailsOpen} unmountOnExit>
                    <Box
                      sx={{
                        px: 1.75,
                        py: 1.75,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Typography variant="body2">
                        Seller: {item.seller.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        Created:{' '}
                        {new Date(item.created_at).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          wordBreak: 'break-all',
                          color: 'grey.600',
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          letterSpacing: 0.02,
                        }}
                      >
                        Item ID: {item.id}
                      </Typography>
                    </Box>
                  </Collapse>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                px: { xs: 2.5, sm: 4 },
                py: 3,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'grey.50',
              }}
            >
              <Reviews id={item.id} />
            </Box>
          </Box>
        </Paper>
      </Box>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={4000}
        open={cartMessage !== null}
      >
        <Alert
          aria-label={cartMessage ?? undefined}
          severity={
            cartMessage === 'Added to cart.' ||
            cartMessage === 'Added to wishlist.'
              ? 'success'
              : 'warning'
          }
          variant="filled"
          sx={{ width: '100%' }}
        >
          {cartMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ItemDisplay;
