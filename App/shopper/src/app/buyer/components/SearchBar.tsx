"use client";

import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SyntheticEvent, useState } from "react";

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
      aria-label="search form"
      component="form"
      onSubmit={handleSubmit}
      role="search"
      sx={{ 
        display: "flex",
        border: 1,
        borderColor: "divider",
        borderRadius: 2
      }}
    >
      <TextField
        fullWidth
        onChange={(event) => setSearchText(event.target.value)}
        placeholder={t("placeholder")}
        size="small"
        slotProps={{
          htmlInput: {
            "aria-label": "search",
          },
        }}
        value={searchText}
      />
      <IconButton
        aria-label="submit search"
        sx={{
          height: 40,
          width: 40,
        }}
        type="submit"
      >
        <SearchIcon />
      </IconButton>
    </Box>
  );
}
