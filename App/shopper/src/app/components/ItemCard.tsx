"use client";

import { useRouter } from 'next/navigation'
import { Box, CardActionArea, CardMedia, Typography } from "@mui/material";

export interface CardItem {
  id: string;
  name: string;
  price: number;
  imageurl: string[];
}

interface ItemCardProps {
  item: CardItem;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ItemCard({ item }: ItemCardProps) {
  const router = useRouter();
  const firstImage = item.imageurl[0];

  return (
    <CardActionArea
      aria-label={"Item Card " + item.id}
      onClick={() => router.push(`/items/${item.id}`)}
      sx={{
        display: "grid",
        minWidth: 170,
        maxWidth: 190,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardMedia
        component="img"
        src={firstImage}
        alt={item.name}
        sx={{
          height: 150,
          objectFit: "cover",
        }}
      />
      <Box
        sx={{
          display: "grid",
          gap: 0.5,
          p: 1,
        }}
      >
        <Typography
          component="h2"
          sx={{
            overflow: "hidden",
            fontSize: "0.95rem",
            fontWeight: 650,
            lineHeight: 1.25,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.name}
        </Typography>
        <Typography sx={{color: "#6e6e6e"}}>
          {currencyFormatter.format(item.price)}
        </Typography>
      </Box>
    </CardActionArea>
  );
}
