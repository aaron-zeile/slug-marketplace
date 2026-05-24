"use client";

import Link from "next/link";
import {
  Box,
  CardActionArea,
  CardMedia,
  Typography,
} from "@mui/material";

export interface LinkCardItem {
  id: string;
  category: string;
  imageurl: string;
  href: string;
}

interface LinkCardProps {
  link: LinkCardItem;
}

const brandColor = "#0f766e";

export default function LinkCard({ link }: LinkCardProps) {
  return (
    <CardActionArea
      aria-label={"Category Link Card " + link.category}
      component={Link}
      href={link.href}
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(15, 118, 110, 0.08)",
        display: "grid",
        gridTemplateColumns: "1fr",
        maxWidth: 190,
        minWidth: 168,
        overflow: "hidden",
        textDecoration: "none",
        transition: (theme) =>
          theme.transitions.create(["box-shadow", "transform", "border-color"], {
            duration: theme.transitions.duration.shorter,
          }),
        "&:hover": {
          borderColor: `${brandColor}44`,
          boxShadow: "0 10px 28px rgba(15, 118, 110, 0.14)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardMedia
        alt={link.category}
        component="img"
        src={link.imageurl}
        sx={{
          height: 148,
          objectFit: "cover",
          width: "100%",
        }}
      />
      <Box
        sx={{
          p: 1.25,
        }}
      >
        <Typography
          aria-label={link.category}
          component="h3"
          sx={{
            display: "-webkit-box",
            fontSize: "0.9rem",
            fontWeight: 650,
            lineHeight: 1.25,
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 1,
          }}
        >
          {link.category}
        </Typography>
      </Box>
    </CardActionArea>
  );
}
