"use client";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { logout } from "../buyer/login/actions";
import GoogleLogin from "../buyer/login/GoogleLogin";

function getAvatarLabel(name: string | null) {
  return name?.trim().charAt(0).toUpperCase() || undefined;
}

export default function Topbar() {
  const [name, setName] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.sessionStorage.getItem("name");
  });
  const [menuPosition, setMenuPosition] = useState<null | {
    left: number;
    top: number;
  }>(null);
  const isMenuOpen = Boolean(menuPosition);

  const handleMenuClose = () => {
    setMenuPosition(null);
  };

  const handleLogout = async () => {
    await logout();
    window.sessionStorage.removeItem("name");
    setName(null);
    handleMenuClose();
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
        <Typography variant="body1">Hello {name ?? "Guest"}</Typography>
        <IconButton
          aria-label="Open profile menu"
          aria-controls={isMenuOpen ? "profile-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isMenuOpen ? "true" : undefined}
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();

            setMenuPosition({
              left: rect.right - 12,
              top: rect.bottom,
            });
          }}
          size="small"
        >
          <Avatar sx={{ width: 36, height: 36 }}>
            {getAvatarLabel(name) ?? <AccountCircleIcon />}
          </Avatar>
        </IconButton>
        <Menu
          id="profile-menu"
          anchorPosition={menuPosition ?? undefined}
          anchorReference="anchorPosition"
          open={isMenuOpen}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          slotProps={{
            paper: {
              sx: {
                width: 260,
                maxWidth: "calc(100vw - 24px)",
              },
            },
          }}
        >
          {name ? (
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          ) : (
            <MenuItem disableRipple>
              <Box sx={{ py: 0.5, width: "100%" }}>
                <GoogleLogin setName={setName} onLogin={handleMenuClose} />
              </Box>
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
