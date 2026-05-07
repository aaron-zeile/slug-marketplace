import React from 'react'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import NavTabs from './Tabs'

export default function TopBar() {
  return (
    <AppBar position='sticky'>
      <Toolbar>
        <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
        </IconButton>
        <Typography>
          Dashboard
        </Typography>
      </Toolbar>
      <NavTabs/>
    </AppBar>
  )
}
