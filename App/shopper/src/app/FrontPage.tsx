'use client';

import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';
import { useTranslations } from 'next-intl';

import HomeHero from './buyer/components/HomeHero';
import ItemCard from './buyer/components/ItemCard';
import ItemCarousel from './buyer/components/ItemCarousel';
import LinkCarousel from './buyer/components/LinkCarousel';
import { fetchRandomItemsAction } from './items/[id]/actions';
import { fetchCurrentUserOrdersAction } from './order/actions';
import { fetchViewedItemsAction } from './viewed/actions';
import { Item } from '../item';
import { type CardItem } from './buyer/components/ItemCard';
import { type LinkCardItem } from './buyer/components/LinkCard';

const toCardItem = (item: Item): CardItem => ({
  id: item.id,
  name: item.name,
  price: item.price,
  imageurl: item.images,
});

const categoryLinkConfig = [
  {
    id: 'electronics',
    imageurl: 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp',
    path: '/search?category=electronics',
  },
  {
    id: 'clothing',
    imageurl: 'https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes/1.webp',
    path: '/search?category=clothing',
  },
  {
    id: 'accessories',
    imageurl: 'https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/1.webp',
    path: '/search?category=accessories',
  },
  {
    id: 'home',
    imageurl: 'https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/1.webp',
    path: '/search?category=home',
  },
  {
    id: 'tools',
    imageurl: 'https://cdn.dummyjson.com/product-images/kitchen-accessories/knife/1.webp',
    path: '/search?category=tools',
  },
  {
    id: 'food',
    imageurl: 'https://cdn.dummyjson.com/product-images/groceries/fish-steak/1.webp',
    path: '/search?category=food',
  },
  {
    id: 'beauty',
    imageurl: 'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp',
    path: '/search?category=beauty',
  },
  {
    id: 'travel',
    imageurl: 'https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp',
    path: '/search?category=travel',
  },
  {
    id: 'health',
    imageurl: 'https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/1.webp',
    path: '/search?category=health',
  },
  {
    id: 'outdoors',
    imageurl: 'https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/1.webp',
    path: '/search?category=outdoors',
  },
  {
    id: 'fitness',
    imageurl: 'https://cdn.dummyjson.com/product-images/sports-accessories/metal-baseball-bat/1.webp',
    path: '/search?category=fitness',
  },
  {
    id: 'vehicles',
    imageurl: 'https://cdn.dummyjson.com/product-images/vehicle/durango-sxt-rwd/1.webp',
    path: '/search?category=vehicles',
  },
  {
    id: 'pets',
    imageurl: 'https://cdn.dummyjson.com/product-images/groceries/cat-food/1.webp',
    path: '/search?category=pets',
  },
  {
    id: 'decor',
    imageurl: 'https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/1.webp',
    path: '/search?category=decor',
  },
] as const;

export default function FrontPage() {
  const t = useTranslations('Home');
  const categoryLinks: LinkCardItem[] = categoryLinkConfig.map((category) => ({
    ...category,
    category: t(`category.${category.id}`),
  }));
  const [singleItem, setSingleItem] = React.useState<CardItem>();
  const [buyAgainItems, setBuyAgainItems] = React.useState<CardItem[]>([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = React.useState<
    CardItem[]
  >([]);
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

    fetchCurrentUserOrdersAction().then((result) => {
      if (!result.success || !result.data) {
        return;
      }

      const seenItems = new Set<string>();
      const orderedItems = result.data
        .flatMap((order) => order.lineItems)
        .filter((item) => {
          if (item.unavailable || seenItems.has(item.itemId)) {
            return false;
          }

          seenItems.add(item.itemId);
          return true;
        })
        .map((item) => ({
          id: item.itemId,
          name: item.name,
          price: item.price,
          imageurl: item.image ? [item.image] : [],
        }));

      setBuyAgainItems(orderedItems);
    });

    fetchViewedItemsAction().then((result) => {
      if (!result.success || !result.data) {
        return;
      }

      setRecentlyViewedItems(
        result.data.map((viewedItem) => toCardItem(viewedItem.item)),
      );
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
        <Box sx={{ mb: 2 }}>
          <Typography
            component="h2"
            sx={{
              color: 'text.primary',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              mb: 1,
            }}
          >
            {t('spotlightTitle')}
          </Typography>

          {loadingSpotlight ? (
            <Skeleton
              sx={{
                borderRadius: 3,
                height: { xs: 200, sm: 140 },
                maxWidth: { sm: 480, md: 520 },
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

        <Box sx={{ mb: 2 }}>
          <LinkCarousel
            carouselTitle={t('categoriesTitle')}
            links={categoryLinks}
            subtitle={t('categoriesSubtitle')}
          />
        </Box>

        {buyAgainItems.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            <ItemCarousel
              carouselTitle={t('buyAgainItems')}
              items={buyAgainItems}
              subtitle={t('buyAgainSubtitle')}
            />
          </Box>
        ) : null}

        {recentlyViewedItems.length > 0 ? (
          <Box sx={{ mb: 2 }}>
            <ItemCarousel
              carouselTitle={t('recentlyViewedItems')}
              items={recentlyViewedItems}
              subtitle={t('recentlyViewedSubtitle')}
            />
          </Box>
        ) : null}

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
