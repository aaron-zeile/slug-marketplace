'use client';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import LocaleSwitcher from '@/components/locale/LocaleSwitcher';
import SearchBar from '../components/SearchBar';
import { checkLogin, logout, type CheckLoginResult } from '../login/actions';
import GoogleLogin from '../login/GoogleLogin';
import CartButton from './CartButton';

const brandColor = '#0f766e';
const sellerDashboardUrl =
  process.env.NEXT_PUBLIC_SELLER_URL ?? '/seller';

function getAvatarLabel(name: string | null) {
  return name?.trim().charAt(0).toUpperCase() || undefined;
}

export default function Topbar() {
  const tTopbar = useTranslations('Topbar');

  const [name, setName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
      const result: CheckLoginResult = await checkLogin().catch(() => ({}));

      if (!active) {
        return;
      }

      setIsAuthenticated(Boolean(result.user || storedName));
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
    setIsAuthenticated(false);
    setName(null);
    handleMenuClose();
  };

  const greeting = name
    ? tTopbar('hello', { name })
    : tTopbar('hello', { name: tTopbar('guest') });

  return (
    <AppBar
      component="header"
      aria-label={tTopbar('navigation')}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: 'none',
        color: 'inherit',
        position: 'sticky',
      }}
    >
      <Container
        sx={{
          maxWidth: 'xl',
          mx: 'auto',
          px: 0,
          width: '100%',
        }}
      >
        <Toolbar
          sx={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: { xs: 1, sm: 1.25, md: 1.5 },
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.25 },
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              maxWidth: { md: 560, lg: 640, xl: 720 },
            }}
          >
            <SearchBar />
          </Box>

          <Stack
            sx={{
              alignItems: 'center',
              flexDirection: 'row',
              flexShrink: 0,
              gap: { xs: 0.25, sm: 0.75 },
            }}
          >
            <Typography
              sx={{
                color: 'text.secondary',
                display: { xs: 'none', lg: 'block' },
                fontSize: '0.875rem',
                lineHeight: 1.5,
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {greeting}
            </Typography>
            <CartButton />
            <IconButton
              aria-label={tTopbar('openProfileMenu')}
              aria-controls={isMenuOpen ? 'profile-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? 'true' : undefined}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();

                setMenuPosition({
                  left: rect.right - 12,
                  top: rect.bottom + 8,
                });
              }}
              sx={{ p: 0.25 }}
            >
              <Avatar
                sx={{
                  bgcolor: name ? brandColor : 'action.selected',
                  color: name ? '#fff' : 'text.secondary',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  height: { xs: 36, sm: 38 },
                  width: { xs: 36, sm: 38 },
                }}
              >
                {getAvatarLabel(name) ?? (
                  <AccountCircleIcon aria-hidden sx={{ fontSize: 20 }} />
                )}
              </Avatar>
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>
      <Menu
        id="profile-menu"
        aria-label={tTopbar('profileMenu')}
        anchorPosition={menuPosition ?? undefined}
        anchorReference="anchorPosition"
        open={isMenuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: {
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: 3,
              maxWidth: 'calc(100vw - 24px)',
              mt: 0.5,
              width: 280,
            },
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {name}
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                  mt: 0.25,
                }}
              >
                {greeting}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              component="a"
              href="/account/addresses"
              sx={{ py: 1.25 }}
            >
              <ListItemIcon>
                <LocalShippingOutlinedIcon aria-hidden sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {tTopbar('shippingAddresses')}
            </MenuItem>
            <MenuItem
              component="a"
              href={sellerDashboardUrl}
              sx={{ py: 1.25 }}
            >
              <ListItemIcon>
                <StorefrontOutlinedIcon aria-hidden sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {tTopbar('sellerDashboard')}
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ py: 1.25 }}>
              <ListItemIcon>
                <LogoutIcon aria-hidden sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {tTopbar('logout')}
            </MenuItem>
            <Divider />
          </>
        ) : (
          <>
            <MenuItem
              aria-label={tTopbar('login')}
              disableRipple
              sx={{ py: 1.5 }}
            >
              <Box sx={{ width: '100%' }}>
                <GoogleLogin
                  setName={setName}
                  onAuthenticated={() => {
                    setIsAuthenticated(true);
                  }}
                  onLogin={handleMenuClose}
                />
              </Box>
            </MenuItem>
            <Divider />
          </>
        )}
        <Box
          sx={{ px: 2, py: 1.5 }}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.02em',
              mb: 1,
              textTransform: 'uppercase',
            }}
          >
            {tTopbar('language')}
          </Typography>
          <LocaleSwitcher variant="menu" />
        </Box>
      </Menu>
    </AppBar>
  );
}
