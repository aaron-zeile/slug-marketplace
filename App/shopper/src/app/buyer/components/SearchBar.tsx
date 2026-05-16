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
        px: 0.5,
        transition: (theme) =>
          theme.transitions.create(["border-color", "background-color", "box-shadow"], {
            duration: theme.transitions.duration.shorter,
          }),
        "&:focus-within": {
          bgcolor: "background.paper",
          borderColor: brandColor,
          boxShadow: `0 0 0 3px ${brandColor}22`,
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
                    height: 32,
                    mr: 0.25,
                    width: 32,
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
              fontSize: "0.95rem",
              py: 0.75,
              px: 1.5,
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
