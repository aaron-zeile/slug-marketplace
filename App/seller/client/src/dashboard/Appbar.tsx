import React from 'react'
import { useTranslations } from 'next-intl'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import NavTabs from './Tabs'
import LocaleSwitcher from '../components/LocaleSwitcher'

export default function TopBar() {
  const t = useTranslations('App')

  return (
    <AppBar position='sticky'>
      <Toolbar>
        <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label={t('openMenu')}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
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
