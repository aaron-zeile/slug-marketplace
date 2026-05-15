import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useDashboard } from './useDashboard'

function tabProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function NavTabs() {
  const {tabValue, setTab} = useDashboard()

  return (
    <Box sx={{ width: '100%'}}>
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTab(newValue)}
        aria-label="basic tabs example"
        sx={{backgroundColor: '#E5E5E5'}}
      >
        <Tab label="Listings" {...tabProps(0)} />
        <Tab label="Sales" {...tabProps(1)} />
        <Tab label="Feedback" {...tabProps(2)} />
        <Tab label="Create Listing" {...tabProps(3)} />
      </Tabs>
    </Box>
  );
}