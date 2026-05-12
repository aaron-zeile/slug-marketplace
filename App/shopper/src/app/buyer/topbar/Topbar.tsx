'use client';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { checkLogin, logout } from '../login/actions';
import GoogleLogin from '../login/GoogleLogin';
import { useRouter } from 'next/navigation';

function getAvatarLabel(name: string | null) {
  return name?.trim().charAt(0).toUpperCase() || undefined;
}

export default function Topbar() {
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<null | {
    left: number;
    top: number;
  }>(null);
  const isMenuOpen = Boolean(menuPosition);

  const handleMenuClose = () => {
    setMenuPosition(null);
  };

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const storedName = window.sessionStorage.getItem('name');
      const result = await checkLogin();

      if (!active) {
        return;
      }

      setName(result.user ? (storedName ?? result.user.name) : storedName);
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    window.sessionStorage.removeItem('name');
    setName(null);
    handleMenuClose();
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Typography
          component="div"
          variant="h6"
          onClick={() => {
            router.push('/');
          }}
        >
          SlugMarketplace
        </Typography>
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
          <Typography variant="body1">Hello {name ?? 'Guest'}</Typography>
          <IconButton
            aria-label="profile"
            aria-controls={isMenuOpen ? 'profile-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={isMenuOpen ? 'true' : undefined}
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
        </Box>
        <Menu
          id="profile-menu"
          anchorPosition={menuPosition ?? undefined}
          anchorReference="anchorPosition"
          open={isMenuOpen}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          slotProps={{
            paper: {
              sx: {
                width: 260,
                maxWidth: 'calc(100vw - 24px)',
              },
            },
          }}
        >
          {name ? (
            <MenuItem aria-label="logout" onClick={handleLogout}>
              Logout
            </MenuItem>
          ) : (
            <MenuItem aria-label="login" disableRipple>
              <Box sx={{ py: 0.5, width: '100%' }}>
                <GoogleLogin setName={setName} onLogin={handleMenuClose} />
              </Box>
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
