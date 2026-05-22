import React from 'react'
import { useTranslations } from 'next-intl'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NavTabs from './Tabs'
import LocaleSwitcher from '../components/LocaleSwitcher'

export default function TopBar() {
  const t = useTranslations('App')

  const shopperUrl = process.env.NODE_ENV == 'development' ? 'http://localhost:3000/' : '/'

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position='sticky'>
      <Toolbar>
        <IconButton
            onClick={open ? handleClose : handleClick}
            aria-controls={open ? 'account-menu' : undefined}
            aria-expanded={open}
            size="large"
            edge="start"
            color="inherit"
            aria-label={t('openMenu')}
            sx={{ mr: 2 }}
          >
            <Avatar />
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
            >
              <MenuItem component="a" href={shopperUrl}>
                <ShoppingCartIcon/> Slug Marketplace
              </MenuItem>
            </Menu>
        </IconButton>
        <Typography sx={{ flexGrow: 1 }}>
          {t('title')}
        </Typography>
        <LocaleSwitcher />
      </Toolbar>
      <NavTabs/>
    </AppBar>
  )
}
