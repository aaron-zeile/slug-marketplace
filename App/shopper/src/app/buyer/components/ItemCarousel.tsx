"use client";

import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import { Box, IconButton, Typography } from "@mui/material";
import { useRef } from "react";

import ItemCard, { type CardItem } from "./ItemCard";

interface ItemCarouselProps {
  items: CardItem[];
  carouselTitle: string;
}

export default function ItemCarousel({
  items, carouselTitle
}: ItemCarouselProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollCarousel = (direction: -1 | 1) => {
    const rail = railRef.current;

    // @ts-expect-error: .
    rail.scrollBy({
      // @ts-expect-error: .
      left: direction * rail.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <Box
      aria-label={"Carousel " + carouselTitle}
      component="section"
      sx={{
        width: "100%",
        py: "20px",
        pb: "28px",
        mx: { md: "auto" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 2,
          pb: 1.5,
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontSize: "1.15rem",
            fontWeight: 750,
            lineHeight: 1.2,
          }}
        >
          {carouselTitle}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            aria-label={`Scroll ${carouselTitle} left`}
            onClick={() => scrollCarousel(-1)}
            size="small"
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            aria-label={`Scroll ${carouselTitle} right`}
            onClick={() => scrollCarousel(1)}
            size="small"
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
      <Box
        ref={railRef}
        sx={{
          display: "grid",
          gridAutoColumns: { xs: "minmax(170px, 78vw)", md: "190px" },
          gridAutoFlow: "column",
          gap: 1.75,
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          px: 2,
          pb: 1.5,
          scrollPaddingInline: 16,
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "& > *": {
            scrollSnapAlign: "start",
          },
        }}
      >
        {items.map((item) => (
          <ItemCard item={item} key={item.id} />
        ))}
      </Box>
    </Box>
  );
}
