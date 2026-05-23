"use client";

import { useRouter } from 'next/navigation';
import {
  Box,
  CardActionArea,
  CardMedia,
  Typography,
} from "@mui/material";
import { useTranslations } from 'next-intl';

export interface CardItem {
  id: string;
  name: string;
  price: number;
  imageurl: string[];
}

interface ItemCardProps {
  item: CardItem;
  variant?: 'default' | 'featured';
}

const brandColor = '#0f766e';

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ItemCard({ item, variant = 'default' }: ItemCardProps) {
  const router = useRouter();
  const t = useTranslations('Home');
  const firstImage = item.imageurl[0];
  const isFeatured = variant === 'featured';

  return (
    <CardActionArea
      aria-label={"Item Card " + item.id}
      onClick={() => router.push(`/items/${item.id}`)}
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(15, 118, 110, 0.08)',
        display: 'grid',
        gridTemplateColumns: '1fr',
        minWidth: isFeatured ? 'auto' : 168,
        overflow: 'hidden',
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'transform', 'border-color'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          borderColor: `${brandColor}44`,
          boxShadow: '0 10px 28px rgba(15, 118, 110, 0.14)',
          transform: 'translateY(-2px)',
        },
        ...(isFeatured
          ? {
              maxWidth: { sm: 480, md: 520 },
              '@media (min-width: 600px)': {
                gridTemplateColumns: 'minmax(120px, 32%) 1fr',
              },
            }
          : {
              maxWidth: 190,
            }),
      }}
    >
      <CardMedia
        alt={item.name}
        component="img"
        src={firstImage}
        sx={{
          height: isFeatured ? 140 : 148,
          objectFit: 'cover',
          width: '100%',
          ...(isFeatured
            ? {
                '@media (min-width: 600px)': {
                  height: '100%',
                  minHeight: 140,
                },
              }
            : {}),
        }}
      />
      <Box
        sx={{
          display: 'grid',
          gap: isFeatured ? 0.5 : 0.5,
          p: isFeatured ? 1.5 : 1.25,
        }}
      >
        <Typography
          aria-label={item.name}
          component="h3"
          sx={{
            fontSize: isFeatured ? '1rem' : '0.9rem',
            fontWeight: isFeatured ? 700 : 650,
            lineHeight: 1.25,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: isFeatured ? 2 : 1,
          }}
        >
          {item.name}
        </Typography>
        <Typography
          sx={{
            color: brandColor,
            fontSize: isFeatured ? '1.05rem' : '0.95rem',
            fontWeight: 700,
          }}
        >
          {currencyFormatter.format(item.price)}
        </Typography>
        {isFeatured ? (
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            {t('viewDetails')}
          </Typography>
        ) : null}
      </Box>
    </CardActionArea>
  );
}
