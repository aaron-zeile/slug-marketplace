import React from 'react'
import type { ReactNode } from "react";
import { useState } from "react";

import { TabContext } from './Context'

interface TabProviderProps {
  children: ReactNode;
}

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
  const [tabValue, setTab] = useState(0);
  return (
    <TabContext.Provider value={{ tabValue, setTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const DashboardProvider = TabProvider;
