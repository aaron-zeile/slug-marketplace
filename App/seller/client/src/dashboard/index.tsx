import React from 'react'
import { DashboardProvider } from './Provider';
import TopBar from './Appbar'
import SellerListings from './Listings';

export default function Dashboard() {
  return (
    <DashboardProvider>
      <TopBar/>
      <SellerListings/>
    </DashboardProvider>
  )
}
