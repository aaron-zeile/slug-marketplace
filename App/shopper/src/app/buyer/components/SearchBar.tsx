"use client";

import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SyntheticEvent, useState } from "react";

const brandColor = "#0f766e";
const brandColorDark = "#0d5c56";

export default function SearchBar() {
  const t = useTranslations("Search");
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedSearchText = searchText.trim();

    if (!trimmedSearchText) {
      return;
    }

    router.push(`/search/${encodeURIComponent(trimmedSearchText)}`);
  };

  return (
    <Box
      aria-label={t("searchForm")}
      component="form"
      onSubmit={handleSubmit}
      role="search"
      sx={{
        alignItems: "center",
        bgcolor: "action.hover",
        border: 1,
        borderColor: "divider",
        borderRadius: 999,
        display: "flex",
        px: { xs: 0.5, md: 0.75 },
        transition: (theme) =>
          theme.transitions.create(["border-color", "background-color", "box-shadow"], {
            duration: theme.transitions.duration.shorter,
          }),
        "&:focus-within": {
          bgcolor: "background.paper",
          borderColor: brandColor,
          boxShadow: `0 0 0 3px ${brandColor}22`,
        },
        "@media (min-width: 900px)": {
          bgcolor: "background.paper",
        },
      }}
    >
      <TextField
        onChange={(event) => setSearchText(event.target.value)}
        placeholder={t("placeholder")}
        slotProps={{
          htmlInput: {
            "aria-label": t("searchInput"),
          },
          input: {
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={t("submitSearch")}
                  type="submit"
                  sx={{
                    bgcolor: brandColor,
                    borderRadius: "50%",
                    color: "#fff",
                    height: { xs: 32, md: 36 },
                    mr: 0.25,
                    width: { xs: 32, md: 36 },
                    "&:hover": {
                      bgcolor: brandColorDark,
                    },
                  }}
                >
                  <SearchIcon aria-hidden sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              fontSize: { xs: "0.95rem", md: "1rem" },
              py: { xs: 0.75, md: 0.9 },
              px: { xs: 1.5, md: 1.75 },
            },
          },
        }}
        sx={{ width: "100%" }}
        value={searchText}
        variant="standard"
      />
    </Box>
  );
}
