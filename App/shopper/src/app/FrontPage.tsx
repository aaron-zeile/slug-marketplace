'use client';

import { Box, Container, Skeleton, Typography } from '@mui/material';
import React from 'react';
import { useTranslations } from 'next-intl';

import HomeHero from './buyer/components/HomeHero';
import ItemCard from './buyer/components/ItemCard';
import ItemCarousel from './buyer/components/ItemCarousel';
import { fetchRandomItemsAction } from './items/[id]/actions';
import { Item } from '../item';
import { type CardItem } from './buyer/components/ItemCard';

const toCardItem = (item: Item): CardItem => ({
  id: item.id,
  name: item.name,
  price: item.price,
  imageurl: item.images,
});

export default function FrontPage() {
  const t = useTranslations('Home');
  const [singleItem, setSingleItem] = React.useState<CardItem>();
  const [carouselItems, setCarouselItems] = React.useState<CardItem[]>([]);
  const [loadingSpotlight, setLoadingSpotlight] = React.useState(true);
  const [loadingCarousel, setLoadingCarousel] = React.useState(true);

  React.useEffect(() => {
    fetchRandomItemsAction(1).then((result) => {
      if (result.success && result.data?.[0]) {
        setSingleItem(toCardItem(result.data[0]));
      }
      setLoadingSpotlight(false);
    });

    fetchRandomItemsAction(15).then((result) => {
      if (result.success && result.data) {
        setCarouselItems(result.data.map(toCardItem));
      }
      setLoadingCarousel(false);
    });
  }, []);

  return (
    <Box
      component="main"
      sx={{
        bgcolor: '#f6f8f7',
        minHeight: '100vh',
        pb: 4,
      }}
    >
      <HomeHero />

      <Box
        sx={{
          mx: 'auto',
          maxWidth: '100%',
          px: 2,
          pt: 2,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            component="h2"
            sx={{
              color: 'text.primary',
              fontSize: '1.05rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              mb: 1.25,
            }}
          >
            {t('spotlightTitle')}
          </Typography>

          {loadingSpotlight ? (
            <Skeleton
              sx={{
                borderRadius: 3,
                height: 300,
                transform: 'none',
              }}
              variant="rectangular"
            />
          ) : singleItem ? (
            <ItemCard item={singleItem} variant="featured" />
          ) : (
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
              {t('spotlightEmpty')}
            </Typography>
          )}
        </Box>

        {loadingCarousel ? (
          <Box>
            <Skeleton
              sx={{
                borderRadius: 1,
                height: 24,
                mb: 1.5,
                maxWidth: 160,
                transform: 'none',
              }}
              variant="rectangular"
            />
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                overflow: 'hidden',
              }}
            >
              {[0, 1, 2].map((key) => (
                <Skeleton
                  key={key}
                  sx={{
                    borderRadius: 3,
                    flexShrink: 0,
                    height: 210,
                    transform: 'none',
                    width: 168,
                  }}
                  variant="rectangular"
                />
              ))}
            </Box>
          </Box>
        ) : carouselItems.length > 0 ? (
          <ItemCarousel
            carouselTitle={t('featuredItems')}
            items={carouselItems}
            subtitle={t('featuredSubtitle')}
          />
        ) : null}
      </Box>
    </Box>
  );
}
