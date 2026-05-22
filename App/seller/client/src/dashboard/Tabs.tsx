import * as React from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Tabs')

  return (
    <Box sx={{ width: '100%'}}>
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTab(newValue)}
        aria-label={t('ariaLabel')}
        sx={{backgroundColor: '#E5E5E5'}}
      >
        <Tab label={t('listings')} {...tabProps(0)} />
        <Tab label={t('sales')} {...tabProps(1)} />
        <Tab label={t('feedback')} {...tabProps(2)} />
        <Tab label={t('createListing')} {...tabProps(3)} />
        <Tab label={t('contactAdmin')} {...tabProps(4)} />
      </Tabs>
    </Box>
  );
}