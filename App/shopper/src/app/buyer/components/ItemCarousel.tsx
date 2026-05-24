"use client";

import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { Box, IconButton, Typography } from "@mui/material";
import { useRef } from "react";

import ItemCard, { type CardItem } from "./ItemCard";

interface ItemCarouselProps {
  items: CardItem[];
  carouselTitle: string;
  subtitle?: string;
}

export default function ItemCarousel({
  items,
  carouselTitle,
  subtitle,
}: ItemCarouselProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollCarousel = (direction: -1 | 1) => {
    const rail = railRef.current;

    rail?.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  return (
    <Box
      aria-label={"Carousel " + carouselTitle}
      component="section"
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        overflow: 'visible',
        pb: 2,
        position: 'relative',
        pt: 2,
        width: '100%',
      }}
    >
      <Box
        sx={{
          alignItems: 'flex-start',
          display: 'flex',
          gap: 1,
          justifyContent: 'space-between',
          px: 2,
          pb: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Typography
            component="h2"
            sx={{
              fontSize: '1.05rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            {carouselTitle}
          </Typography>
          {subtitle ? (
            <Typography
              sx={{
                color: 'text.secondary',
                fontSize: '0.8rem',
                lineHeight: 1.4,
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.5 }}>
          <IconButton
            aria-label={`Scroll ${carouselTitle} left`}
            onClick={() => scrollCarousel(-1)}
            sx={{
              bgcolor: 'action.hover',
              border: 1,
              borderColor: 'divider',
              height: 36,
              width: 36,
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <ChevronLeft sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton
            aria-label={`Scroll ${carouselTitle} right`}
            onClick={() => scrollCarousel(1)}
            sx={{
              bgcolor: 'action.hover',
              border: 1,
              borderColor: 'divider',
              height: 36,
              width: 36,
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <ChevronRight sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>
      <Box
        ref={railRef}
        sx={{
          '& > *': {
            scrollSnapAlign: 'start',
          },
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          display: 'grid',
          gap: 1.5,
          gridAutoColumns: 'minmax(168px, 72vw)',
          gridAutoFlow: 'column',
          mb: -2.5,
          mt: -2,
          overflowX: 'auto',
          overflowY: 'visible',
          overscrollBehaviorX: 'contain',
          pb: 2.5,
          pt: 2,
          px: 2,
          scrollPaddingInline: 16,
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map((item) => (
          <ItemCard item={item} key={item.id} />
        ))}
      </Box>
    </Box>
  );
}
