import React, { useContext, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  capitalize,
} from '@mui/material';

import type { Listing } from '../../../shared';
import { ErrorContext } from '../error/Context';
import { remove, update } from './model';
import ListingReviews from './ListingReviews';

interface ListingDraft {
  name: string;
  description: string;
  price: string;
  quantity: string;
  images: string;
}

interface ListingEditDialogProps {
  open: boolean;
  listing?: Listing;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onUpdated: (listing: Listing) => void;
}

const draftFromListing = (listing: Listing): ListingDraft => ({
  name: listing.name,
  description: listing.description,
  price: String(listing.price),
  quantity: String(listing.quantity),
  images: listing.images.join('\n'),
});

const normalizeImages = (images: string) =>
  images
    .split(/\r?\n/)
    .map((image) => image.trim())
    .filter(Boolean);

export default function ListingEditDialog({
  open,
  listing,
  onClose,
  onDeleted,
  onUpdated,
}: ListingEditDialogProps) {
  const t = useTranslations('Listings');
  const errorCtx = useContext(ErrorContext);
  const [draft, setDraft] = useState<ListingDraft | undefined>();
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const setError =
    errorCtx?.setError ??
    (() => {
      /* no error provider */
    });
  const price = Number(draft?.price ?? '');
  const priceError =
    draft?.price !== undefined &&
    draft.price !== '' &&
    (!Number.isFinite(price) || price < 0.01);
  const quantity = Number(draft?.quantity ?? '');
  const quantityError =
    draft?.quantity !== undefined &&
    draft.quantity !== '' &&
    (!Number.isInteger(quantity) || quantity < 1);
  const canSave = Boolean(
    listing &&
    draft?.name.trim() &&
    draft.description.trim() &&
    Number.isFinite(price) &&
    price >= 0.01 &&
    Number.isInteger(quantity) &&
    quantity >= 1,
  );

  useEffect(() => {
    setDraft(listing ? draftFromListing(listing) : undefined);
  }, [listing]);

  const updateDraft =
    (field: keyof ListingDraft) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDraft((current) => ({
        ...current!,
        [field]: event.target.value,
      }));
    };

  const handleDelete = async () => {
    setDeleting(true);
    const deleted = await remove(listing!.id, setError);
    setDeleting(false);

    if (deleted) {
      onDeleted(listing!.id);
      onClose();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const updated = await update(
      listing!.id,
      {
        name: draft!.name.trim(),
        description: draft!.description.trim(),
        price,
        quantity,
        images: normalizeImages(draft!.images),
      },
      setError,
    );
    setSaving(false);

    if (updated) {
      onUpdated(updated);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="listing-edit-title"
    >
      <DialogTitle id="listing-edit-title">
        {listing
          ? t('editTitle', { name: listing.name })
          : t('editFallbackTitle')}
      </DialogTitle>

      <DialogContent>
        {listing && draft && (
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Avatar
                variant="rounded"
                src={listing.images?.[0]}
                alt={listing.name}
                sx={{ width: 168, height: 168 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline">
                  {capitalize(listing.status)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('createdAt', {
                    date: new Date(listing.created_at).toLocaleDateString(),
                  })}
                </Typography>
              </Box>
            </Stack>

            <TextField
              label={t('name')}
              value={draft.name}
              onChange={updateDraft('name')}
              required
              inputProps={{
                'aria-label': t('nameInput', { name: listing.name }),
                maxLength: 256,
              }}
              fullWidth
            />

            <TextField
              label={t('description')}
              value={draft.description}
              onChange={updateDraft('description')}
              required
              multiline
              minRows={5}
              inputProps={{
                'aria-label': t('descriptionInput', { name: listing.name }),
                maxLength: 1024,
              }}
              fullWidth
            />

            <TextField
              label={t('price')}
              value={draft.price}
              onChange={updateDraft('price')}
              required
              error={priceError}
              helperText={priceError ? t('priceError') : undefined}
              type="number"
              inputProps={{
                'aria-label': t('priceInput', { name: listing.name }),
                min: 0.01,
                step: '0.01',
              }}
              fullWidth
            />

            <TextField
              label={t('quantity')}
              value={draft.quantity}
              onChange={updateDraft('quantity')}
              required
              error={quantityError}
              helperText={quantityError ? t('quantityError') : undefined}
              type="number"
              inputProps={{
                'aria-label': t('quantityInput', { name: listing.name }),
                min: 1,
                step: 1,
              }}
              fullWidth
            />

            <TextField
              label={t('images')}
              value={draft.images}
              onChange={updateDraft('images')}
              multiline
              minRows={3}
              inputProps={{
                'aria-label': t('imagesInput', { name: listing.name }),
              }}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Customer Reviews
              </Typography>
              <ListingReviews itemId={listing.id} />
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button
          color="error"
          aria-label={
            listing ? t('deleteAria', { name: listing.name }) : undefined
          }
          disabled={!listing || deleting || saving}
          startIcon={<DeleteIcon />}
          onClick={() => void handleDelete()}
        >
          {deleting ? t('deleting') : t('delete')}
        </Button>
        <Button
          aria-label={
            listing ? t('updateAria', { name: listing.name }) : undefined
          }
          disabled={!canSave || deleting || saving}
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => void handleSave()}
        >
          {saving ? t('updating') : t('update')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
